package com.payTrackEdu.application.utils;

import com.payTrackEdu.application.domain.AcademicYear;
import com.payTrackEdu.application.dtos.academicYear.AcademicYearRequest;
import com.payTrackEdu.application.dtos.academicYear.AcademicYearResponse;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface OwnMapper {
    OwnMapper INSTANCE_MAPPER = Mappers.getMapper(OwnMapper.class);


    @Mapping(
            target = "createdAt",
            expression = "java(academicYear.getCreatedAt() != null ? academicYear.getCreatedAt().toLocalDate() : null)"
    )
    AcademicYearResponse toAcademicYearResponse(AcademicYear academicYear);


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "code", expression = "java(request.code().trim())")
    @Mapping(target = "status", expression = "java(request.status()==null ? YearStatus.ACTIVE : request.status())")
    void fromRequestAcademicYearToEntity(AcademicYearRequest request, @MappingTarget AcademicYear academicYear);

}
