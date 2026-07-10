package ec.edu.espe.usuarios.config.security;

import ec.edu.espe.usuarios.models.User;
import ec.edu.espe.usuarios.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con username: " + username));
        // Carga forzada de roles y sus detalles para evitar LazyInitializationException
        user.getRoles().forEach(ur -> {
            if (ur.getRole() != null) {
                ur.getRole().getName(); // Carga forzada del proxy Role
            }
        });
        return new CustomUserDetails(user);
    }
}
