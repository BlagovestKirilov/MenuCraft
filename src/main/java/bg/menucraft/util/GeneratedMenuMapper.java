package bg.menucraft.util;

import bg.menucraft.enums.MealEnum;
import bg.menucraft.model.GeneratedMeal;
import bg.menucraft.model.GeneratedMenu;
import bg.menucraft.model.dto.MealDto;
import bg.menucraft.model.request.MenuGenerationRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
public interface GeneratedMenuMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "template", ignore = true) // we set it manually
    @Mapping(target = "meals", expression = "java(mapMeals(request))")
    GeneratedMenu toEntity(MenuGenerationRequest request);


    // ---- Custom method to merge all meals ----
    default List<GeneratedMeal> mapMeals(MenuGenerationRequest request) {
        List<GeneratedMeal> meals = new ArrayList<>();

        if (request.getSalads() != null) {
            meals.addAll(
                    request.getSalads()
                            .stream()
                            .map(dto -> toMeal(dto, MealEnum.SALAD))
                            .toList()
            );
        }

        if (request.getSoups() != null) {
            meals.addAll(
                    request.getSoups()
                            .stream()
                            .map(dto -> toMeal(dto, MealEnum.SOUP))
                            .toList()
            );
        }

        if (request.getMainCourses() != null) {
            meals.addAll(
                    request.getMainCourses()
                            .stream()
                            .map(dto -> toMeal(dto, MealEnum.MAIN_COURSE))
                            .toList()
            );
        }

        return meals;
    }


    // helper method
    default GeneratedMeal toMeal(MealDto dto, MealEnum type) {
        GeneratedMeal meal = new GeneratedMeal();
        meal.setName(dto.getName());
        meal.setPrice(dto.getPrice());
        meal.setType(type);
        return meal;
    }
}
