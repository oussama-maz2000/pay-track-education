package com.payTrackEdu.application.utils;

import com.payTrackEdu.application.domain.AcademicYear;
import com.payTrackEdu.application.domain.User;
import com.payTrackEdu.application.dtos.academicYear.AcademicYearRequest;
import com.payTrackEdu.application.dtos.academicYear.AcademicYearResponse;
import com.payTrackEdu.application.dtos.user.RequestUser;
import com.payTrackEdu.application.dtos.user.ResponseUser;
import com.payTrackEdu.application.dtos.user.UpdateUser;
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


    @Mapping(target = "id",ignore = true)
    @Mapping(target = "active",ignore = true)
    @Mapping(target = "password",ignore = true)
    User fromUserDto(RequestUser userRequest);


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "active", source = "isActive")
    void fromRequestUserToEntity(UpdateUser userUpdated,@MappingTarget User user);

    @Mapping( target = "createdAt",
            expression = "java(user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate() : null)")
    @Mapping(target = "isActive", source = "active")
    ResponseUser fromUserToResponse(User user);
}
