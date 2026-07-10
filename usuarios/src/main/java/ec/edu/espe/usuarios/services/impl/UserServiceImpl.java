package ec.edu.espe.usuarios.services.impl;

import ec.edu.espe.usuarios.dto.request.UserCreateRequest;
import ec.edu.espe.usuarios.dto.response.PersonResponse;
import ec.edu.espe.usuarios.dto.response.UserResponse;
import ec.edu.espe.usuarios.models.*;
import ec.edu.espe.usuarios.repositories.PersonRepository;
import ec.edu.espe.usuarios.repositories.RoleRepository;
import ec.edu.espe.usuarios.repositories.UserRepository;
import ec.edu.espe.usuarios.repositories.UserRoleRepository;
import ec.edu.espe.usuarios.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PersonRepository personRepository;

    private final UserRoleRepository userRoleRepository;
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest userRequest) {
        // 1. Validaciones de unicidad (DNI y Email)
        if (personRepository.existsByEmail(userRequest.getEmail())) {
            throw new IllegalArgumentException("El correo electrónico ya está registrado");
        }
        if (personRepository.existsByDni(userRequest.getDni())){
            throw new IllegalArgumentException("El DNI ya esta registrado");
        }

        // 2. Instanciar la Persona (SIN GUARDAR todavía)
        Person person = Person.builder()
                .dni(userRequest.getDni())
                .firtsName(userRequest.getFirstName())
                .middleName(userRequest.getMiddleName())
                .secondName(userRequest.getSecondName())
                .lastName(userRequest.getLastName())
                .email(userRequest.getEmail())
                .phone(userRequest.getPhone())
                .address(userRequest.getAddress())
                .nationality(userRequest.getNationality())
                .active(true)
                .build();

        // 3. Generación del username: macoronado
        // Primera letra del primer nombre (m)
        String f1 = userRequest.getFirstName().substring(0, 1).toLowerCase();

        // Primera letra del segundo nombre (a)
        String f2 = (userRequest.getSecondName() != null && !userRequest.getSecondName().isBlank())
                ? userRequest.getSecondName().substring(0, 1).toLowerCase()
                : "";

        // Primer apellido completo (coronado) - que en tu JSON viene en middleName
        String a1 = userRequest.getMiddleName().toLowerCase().replace(" ", "");

        // Generamos el username omitiendo la inicial del segundo apellido
        String generatedUsername = f1 + f2 + a1;

        // Logica de duplicados: El primero va solo, el segundo lleva el 2, etc.
        long count = userRepository.countByUsernameStartingWith(generatedUsername);

        String finalUsername = (count > 0) ? generatedUsername + count : generatedUsername;

        // 4. Crear el Usuario y VINCULARLO a la persona
        User user = User.builder()
                .person(person) // Aquí MapsId hará su trabajo
                .username(finalUsername)
                .passwordHash(passwordEncoder.encode(userRequest.getDni())) // O tu encoder
                .active(true)
                .build();

        // Establecer la relación bidireccional
        person.setUser(user);

        // 5. GUARDAR TODO EN CASCADA
        // Al guardar la person, Hibernate generará el ID y lo pasará al User automáticamente
        person = personRepository.save(person);

        // 6. Retornar usando el usuario persistido
        return mapToUserResponse(person.getUser());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsers(){
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse assigneRole(UUID userId, UUID roleId) {
        // 1. Buscar el usuario y el rol, lanzar excepción si no existen
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));

        if (userRoleRepository.existsByUserIdAndRoleId(userId, roleId))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El rol ya esta asociado a un usuario");

        UserRoleId userRoleId = new UserRoleId(userId, roleId);

        // 1. Crear la nueva relación UserRole
        UserRole userRole = UserRole.builder()
                .id(userRoleId)
                .user(user)
                .role(role)
                .active(true)
                .build();

        // 2. Añadirlo a la memoria del usuario (¡NO uses userRoleRepository.save!)
        user.getRoles().add(userRole);

        // 3. Guardar el usuario. Por el CascadeType.ALL, Hibernate insertará en la tabla user_role automáticamente
        userRepository.save(user);

        // 4. Retornar el UserResponse actualizado
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        // 1. Obtener nombres de roles (String)
        List<String> roles = user.getRoles().stream()
                .filter(UserRole::getActive)
                .map(ur -> ur.getRole().getName())
                .collect(Collectors.toList());

        // 2. Mapeo de la Persona: Convertir Entidad (Person) a DTO (PersonResponse)
        Person personEntity = user.getPerson();

        PersonResponse personDTO = PersonResponse.builder()
                .id(personEntity.getId())
                .dni(personEntity.getDni())
                .firstName(personEntity.getFirtsName())
                .secondName(personEntity.getSecondName())
                .middleName(personEntity.getMiddleName())
                .lastName(personEntity.getLastName())
                .email(personEntity.getEmail())
                .phone(personEntity.getPhone())
                .address(personEntity.getAddress())
                .nationality(personEntity.getNationality())
                .active(personEntity.getActive())
                .build();

        // 3. Mapeo del Usuario: Aquí es donde fallaba
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .active(user.getActive())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .person(personDTO)
                .roles(roles)
                .build();
    }
}