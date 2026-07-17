package ec.edu.espe.usuarios.config;

import ec.edu.espe.usuarios.models.*;
import ec.edu.espe.usuarios.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeed implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Crear el rol ADMINISTRADOR si no existe
        if (!roleRepository.existsByName("ADMINISTRADOR")) {
            Role adminRole = Role.builder()
                    .name("ADMINISTRADOR")
                    .description("Rol maestro del sistema con acceso total")
                    .active(true)
                    .build();
            roleRepository.save(adminRole);
            System.out.println("SEEDER: Rol ADMINISTRADOR creado.");
        }

        // 2. Crear el usuario 'admin' inicial con el rol si no existe
        if (!userRepository.existsByUsername("admin")) {
            Person person = Person.builder()
                    .dni("9999999999")
                    .firtsName("Administrador")
                    .secondName("Del")
                    .middleName("Sistema")
                    .lastName("Global")
                    .email("admin@parqueadero.com")
                    .phone("0999999999")
                    .address("Quito")
                    .nationality("Ecuatoriana")
                    .active(true)
                    .build();
            
            person = personRepository.save(person);

            User user = User.builder()
                    .person(person)
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .active(true)
                    .build();
            
            user = userRepository.save(user);

            Role role = roleRepository.findAll().stream()
                    .filter(r -> r.getName().equals("ADMINISTRADOR"))
                    .findFirst()
                    .orElse(null);
            
            if (role != null) {
                UserRoleId userRoleId = new UserRoleId(user.getId(), role.getId());
                UserRole userRole = UserRole.builder()
                        .id(userRoleId)
                        .user(user)
                        .role(role)
                        .active(true)
                        .build();
                userRoleRepository.save(userRole);
                System.out.println("SEEDER: Usuario 'admin' (pass: admin123) creado y asignado como ADMINISTRADOR.");
            }
        }
    }
}
