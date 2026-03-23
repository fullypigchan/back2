package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.exception.AdvertisementNotFoundException;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.AdSearch;
import com.app.globalgates.domain.AdvertisementVO;
import com.app.globalgates.dto.AdWithPagingDTO;
import com.app.globalgates.dto.AdvertisementDTO;
import com.app.globalgates.dto.FileAdvertisementDTO;
import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.repository.AdvertisementDAO;
import com.app.globalgates.repository.FileAdvertisementDAO;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdvertisementService {
    private final AdvertisementDAO advertisementDAO;
    private final FileDAO fileDAO;
    private final FileAdvertisementDAO fileAdvertisementDAO;

    // 광고 등록
    @Transactional
    public void save(AdvertisementDTO advertisementDTO) {
        advertisementDAO.save(advertisementDTO);
    }

    // 광고 이미지 저장
    @Transactional
    public void saveFile(Long adId, MultipartFile image, String s3Key) {
        FileDTO fileDTO = new FileDTO();
        fileDTO.setOriginalName(image.getOriginalFilename());
        fileDTO.setFileName(s3Key);
        fileDTO.setFilePath(s3Key);
        fileDTO.setFileSize(image.getSize());
        fileDTO.setContentType(image.getContentType().contains("image")
                ? FileContentType.IMAGE : FileContentType.ETC);
        fileDAO.save(fileDTO);

        FileAdvertisementDTO fileAdDTO = new FileAdvertisementDTO();
        fileAdDTO.setId(fileDTO.getId());
        fileAdDTO.setAdId(adId);
        fileAdvertisementDAO.save(fileAdDTO.toFileAdVO());
    }

    // 광고 검색 조회 (검색값 포함해서 조회)
    @Cacheable(
            value = "ad:list",
            key = "'page:' + #page" +
                    " + ':memberId:' + #search.memberId" +
                    " + ':keyword:' + (#search.keyword ?: '')" +
                    " + ':filter:' + (#search.filter ?: 'all')"
    )
    public AdWithPagingDTO list(int page, AdSearch search) {
        AdWithPagingDTO adWithPagingDTO = new AdWithPagingDTO();
        Criteria criteria = new Criteria(page, advertisementDAO.getTotal(search));

        // 이미지 등록
        List<AdvertisementDTO> ads = advertisementDAO.findBySearch(criteria, null).stream()
                .map(adDTO -> {
                    List<FileAdvertisementDTO> images = new ArrayList<>(fileAdvertisementDAO.findByAdId(adDTO.getId()));
                    if (!images.isEmpty()) {
                        adDTO.setAdImageList(
                                images.stream()
                                        .map(FileAdvertisementDTO::getFilePath)
                                        .collect(Collectors.toList())
                        );
                    }
                    return adDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(ads.size() > criteria.getRowCount());
        adWithPagingDTO.setCriteria(criteria);

        if(criteria.isHasMore()) {
            ads.remove(ads.size() - 1);
        }

        ads.forEach(adDTO -> {
            adDTO.setCreatedDatetime(DateUtils.toRelativeTime(adDTO.getCreatedDatetime()));
        });
        adWithPagingDTO.setAdvertisements(ads);

        return adWithPagingDTO;
    }

    // 광고 상세 조회
    @Cacheable(value = "ad:detail", key = "#id")
    public AdvertisementDTO getAdvertisementDetail(Long id) {
        AdvertisementDTO adDetail = toDTO(advertisementDAO.findById(id)
                .orElseThrow(AdvertisementNotFoundException::new));

        List<FileAdvertisementDTO> images = fileAdvertisementDAO.findByAdId(adDetail.getId());
        if (!images.isEmpty()) {
            adDetail.setAdImageList(
                    images.stream()
                            .map(FileAdvertisementDTO::getFilePath)
                            .collect(Collectors.toList())
            );
        }

        return adDetail;
    }

    // 광고 이미지 삭제
    @Transactional
    public void delete(Long id) {
        List<FileAdvertisementDTO> files = fileAdvertisementDAO.findByAdId(id);

        fileAdvertisementDAO.deleteByAdId(id);
        files.forEach(file -> fileDAO.delete(file.getId()));

        advertisementDAO.delete(id);
    }


    // toDTO
    public AdvertisementDTO toDTO(AdvertisementVO adVO) {
        AdvertisementDTO adDTO = new AdvertisementDTO();
        adDTO.setId(adVO.getId());
        adDTO.setAdvertiserId(adVO.getAdvertiserId());
        adDTO.setTitle(adVO.getTitle());
        adDTO.setHeadline(adVO.getHeadline());
        adDTO.setDescription(adVO.getDescription());
        adDTO.setLandingUrl(adVO.getLandingUrl());
        adDTO.setBudget(adVO.getBudget());
        adDTO.setImpressionEstimate(adVO.getImpressionEstimate());
        adDTO.setReceiptId(adVO.getReceiptId());
        adDTO.setStatus(adVO.getStatus());
        adDTO.setCreatedDatetime(adVO.getCreatedDatetime());
        adDTO.setUpdatedDatetime(adVO.getUpdatedDatetime());

        return adDTO;
    }

    // 오늘자 경로 생성
    public String getTodayPath(){
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }

}
