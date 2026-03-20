package com.app.globalgates.controller.advertisement;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.common.search.AdSearch;
import com.app.globalgates.dto.AdWithPagingDTO;
import com.app.globalgates.dto.AdvertisementDTO;
import com.app.globalgates.service.AdvertisementService;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ad/**")
@Slf4j
public class AdvertisementAPIController implements AdvertisementAPIControllerDocs {
    private final AdvertisementService advertisementService;
    private final S3Service s3Service;

//    광고 등록
    @PostMapping("write")
    @LogStatus
    public ResponseEntity<?> write(@RequestBody AdvertisementDTO advertisementDTO,
                                    @RequestParam("images") ArrayList<MultipartFile> images) throws IOException {
        String todayPath = advertisementService.save(advertisementDTO, images);

        if(!images.isEmpty()) {
            for(MultipartFile image : images) {
                s3Service.uploadFile(image, todayPath);
            }
        }

        return ResponseEntity.ok("광고 등록 성공!");
    }

//    광고 검색
    @GetMapping("list/{page}")
    @LogStatus
    public ResponseEntity<?> list(int page, AdSearch search) {
        AdWithPagingDTO adList = advertisementService.list(page, search);

        return ResponseEntity.ok(adList);
    }

    @GetMapping("detail")
    public ResponseEntity<?> detail(Long id) {
        AdvertisementDTO adDTO = null;
        return null;
    }

}
