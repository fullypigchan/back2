package com.app.globalgates.repository;

import com.app.globalgates.dto.CategoryDTO;
import com.app.globalgates.mapper.CategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CategoryDAO {
    private final CategoryMapper categoryMapper;

    public void save(CategoryDTO categoryDTO) {
        categoryMapper.insert(categoryDTO);
    }

    public Optional<CategoryDTO> findById(Long id) {
        return categoryMapper.selectById(id);
    }

    public List<CategoryDTO> findByCategoryName(String
                                                            categoryName) {
        return categoryMapper.selectByCategoryName(categoryName);
    }

    public void delete(Long id) {
        categoryMapper.delete(id);
    }
}