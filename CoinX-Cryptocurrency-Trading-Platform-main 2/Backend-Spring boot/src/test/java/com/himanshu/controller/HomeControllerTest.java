package com.himanshu.controller;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REST controller responsible for HomeControllerTest endpoints.
 */
class HomeControllerTest {

    @Test
    void homeController_shouldReturnAcceptedStatusAndExpectedBody() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new HomeController()).build();

        mockMvc.perform(get("/"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").value("welcome to crypto treading platform working fine"))
                .andExpect(jsonPath("$.status").value(true));
    }
}
