package com.app.globalgates.mapper;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
public class PostProductMapperTests {
    @Autowired
    private PostMapper postMapper;
    @Autowired
    private PostProductMapper postProductMapper;

    @Test
    public void testSelectProducts() {

    }
}
