package com.edu.espe.usuarios.services.impl;

import com.edu.espe.usuarios.dto.request.UserCreateRequest;
import com.edu.espe.usuarios.dto.response.PersonResponse;
import com.edu.espe.usuarios.dto.response.UserResponse;
import com.edu.espe.usuarios.entity.*;
import com.edu.espe.usuarios.repository.PersonRepository;
import com.edu.espe.usuarios.repository.RoleRepository;
import com.edu.espe.usuarios.repository.UserRepository;
import com.edu.espe.usuarios.repository.UserRoleRepository;
import com.edu.espe.usuarios.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.edu.espe.usuarios.messaging.AuditProducerService;
import java.util.Map;

import java.text.Normalizer;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditProducerService auditProducer;

    @Override
    public UserResponse createUser(UserCreateRequest request) {

        if (personRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya existe");
        }

        if (personRepository.existsByDni(request.getDni())) {
            throw new IllegalArgumentException("El DNI ya existe");
        }

        if (personRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("El teléfono ya existe");
        }

        Person person = Person.builder()
                .dni(request.getDni())
                .firstName(request.getFirstName())
                .middleName(request.getMiddleName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .nationality(request.getNationality())
                .active(true)
                .build();

        person = personRepository.save(person);

        String username = generateUsername(
                request.getFirstName(),
                request.getMiddleName(),
                request.getLastName()
        );

        User user = User.builder()
                .person(person)
                .username(username)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .build();

        user = userRepository.save(user);

        // 🔴 DISPARAR AUDITORÍA
        auditProducer.enviarEventoAuditoria(
                "CREATE",
                "USUARIO",
                Map.of("email", person.getEmail(), "dni", person.getDni(), "username", user.getUsername()),
                user.getId() // Pasamos el UUID del usuario recién creado
        );

        return mapToUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        return mapToUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByDni(String dni) {
        User user = userRepository.findByPersonDni(dni)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con DNI: " + dni));

        return mapToUserResponse(user);
    }

    @Override
    public UserResponse assignRole(UUID userId, UUID roleId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

        if (userRoleRepository.existsByUser_IdAndRole_Id(userId, roleId)) {
            throw new IllegalArgumentException("El usuario ya tiene asignado ese rol");
        }

        UserRoleId userRoleId = new UserRoleId(userId, roleId);

        UserRole userRole = UserRole.builder()
                .id(userRoleId)
                .user(user)
                .role(role)
                .active(true)
                .build();

        UserRole savedUserRole = userRoleRepository.save(userRole);
        user.getUserRoles().add(savedUserRole);

        // 🔴 DISPARAR AUDITORÍA (ACTUALIZAR: ASIGNAR ROL)
        auditProducer.enviarEventoAuditoria(
                "UPDATE",
                "USUARIO-ROL", 
                Map.of(
                    "usuario", user.getUsername(), 
                    "rolAsignado", role.getName()
                ),
                user.getId() 
        );

        return mapToUserResponse(user);
    }

    private String generateUsername(String firstName, String middleName, String lastName) {
        String base = "";

        if (firstName != null && !firstName.isBlank()) {
            base += firstName.substring(0, 1);
        }

        if (middleName != null && !middleName.isBlank()) {
            base += middleName.substring(0, 1);
        }

        if (lastName != null && !lastName.isBlank()) {
            base += lastName;
        }

        base = normalize(base).toLowerCase();

        if (base.length() > 15) {
            base = base.substring(0, 15);
        }

        String username = base;
        int counter = 1;

        while (userRepository.existsByUsername(username)) {
            String suffix = String.valueOf(counter);
            int maxBaseLength = 20 - suffix.length();

            String tempBase = base;
            if (tempBase.length() > maxBaseLength) {
                tempBase = tempBase.substring(0, maxBaseLength);
            }

            username = tempBase + suffix;
            counter++;
        }

        return username;
    }

    private String normalize(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD);
        return normalized.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .replaceAll("\\s+", "");
    }

    private UserResponse mapToUserResponse(User user) {
        Person person = user.getPerson();

        List<String> roles = user.getUserRoles()
                .stream()
                .filter(UserRole::getActive)
                .map(userRole -> userRole.getRole().getName())
                .toList();

        PersonResponse personResponse = PersonResponse.builder()
                .id(person.getId())
                .dni(person.getDni())
                .firstName(person.getFirstName())
                .middleName(person.getMiddleName())
                .lastName(person.getLastName())
                .email(person.getEmail())
                .phone(person.getPhone())
                .address(person.getAddress())
                .nationality(person.getNationality())
                .build();

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .active(user.getActive())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .person(personResponse)
                .roles(roles)
                .build();
    }
}