package com.himanshu.controller;

import com.himanshu.model.Asset;
import com.himanshu.model.User;
import com.himanshu.service.AssetService;
import com.himanshu.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
/**
 * REST controller responsible for AssetControllerTest endpoints.
 */
class AssetControllerTest {

    @Mock
    private AssetService assetService;
    @Mock
    private UserService userService;
    @InjectMocks
    private AssetController assetController;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(assetController, "userService", userService);
    }

    @Test
    void getAssetById_shouldReturnAsset() {
        Asset asset = new Asset();
        asset.setId(1L);
        when(assetService.getAssetById(1L)).thenReturn(asset);

        ResponseEntity<Asset> response = assetController.getAssetById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getAssetByUserIdAndCoinId_shouldReturnUserAsset() throws Exception {
        User user = new User();
        user.setId(10L);
        Asset asset = new Asset();
        asset.setId(2L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(assetService.findAssetByUserIdAndCoinId(10L, "btc")).thenReturn(asset);

        ResponseEntity<Asset> response = assetController.getAssetByUserIdAndCoinId("btc", "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2L, response.getBody().getId());
    }

    @Test
    void getAssetsForUser_shouldReturnAssets() throws Exception {
        User user = new User();
        user.setId(9L);
        Asset asset = new Asset();
        asset.setId(7L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(assetService.getUsersAssets(9L)).thenReturn(List.of(asset));

        ResponseEntity<List<Asset>> response = assetController.getAssetsForUser("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(7L, response.getBody().get(0).getId());
    }
}
