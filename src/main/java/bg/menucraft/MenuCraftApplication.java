package bg.menucraft;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
@SpringBootApplication
public class MenuCraftApplication {

    static void main(String[] args) {
        SpringApplication.run(MenuCraftApplication.class, args);
    }

}
