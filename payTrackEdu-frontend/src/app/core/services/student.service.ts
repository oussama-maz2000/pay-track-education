import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_STUDENT_ENDPOINTS } from '../api/student.api';
import { HttpClientApi } from '../internal/http-client/http-client-api.service';
import { ApiResponse } from '../model/api-response.model';
import { ResponsePage } from '../model/application.model';
import {
  StudentDetails,
  StudentDto,
  StudentForEnrollment,
  StudentRequest,
} from '../model/student.model';

@Service()
export class StudentService {
  private readonly httpClientApi = inject(HttpClientApi);

  createStudent$(
    payload: StudentRequest,
  ): Observable<ApiResponse<StudentDetails>> {
    return this.httpClientApi.processRequest$<ApiResponse<StudentDetails>>(
      API_STUDENT_ENDPOINTS.SAVE_STUDENT,
      { body: payload },
    );
  }

  fetchStudents$(
    page: number,
    size: number,
    studentName?: string,
  ): Observable<ApiResponse<ResponsePage<StudentDto>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<StudentDto>>
    >(API_STUDENT_ENDPOINTS.FETCH_STUDENTS, {
      queryParams: { page, size, ...(studentName ? { studentName } : {}) },
    });
  }

  fetchStudentsForEnrollment$(
    page: number,
    size: number,
  ): Observable<ApiResponse<ResponsePage<StudentForEnrollment>>> {
    return this.httpClientApi.processRequest$<
      ApiResponse<ResponsePage<StudentForEnrollment>>
    >(API_STUDENT_ENDPOINTS.FETCH_STUDENTS_FOR_ENROLLMENT, {
      queryParams: { page, size },
    });
  }

  getStudentById$(id: string): Observable<ApiResponse<StudentDetails>> {
    return this.httpClientApi.processRequest$<ApiResponse<StudentDetails>>(
      API_STUDENT_ENDPOINTS.GET_STUDENT_BY_ID,
      {
        pathParams: { id },
      },
    );
  }

  updateStudent$(
    id: string,
    payload: StudentRequest,
  ): Observable<ApiResponse<StudentDetails>> {
    return this.httpClientApi.processRequest$<ApiResponse<StudentDetails>>(
      API_STUDENT_ENDPOINTS.UPDATE_STUDENT,
      {
        pathParams: { id },
        body: payload,
      },
    );
  }

  deleteStudent$(id: string): Observable<void> {
    return this.httpClientApi.processRequest$<void>(
      API_STUDENT_ENDPOINTS.DELETE_STUDENT,
      { pathParams: { id } },
    );
  }

  restoreStudent$(id: string): Observable<ApiResponse<StudentDetails>> {
    return this.httpClientApi.processRequest$<ApiResponse<StudentDetails>>(
      API_STUDENT_ENDPOINTS.RESTORE_STUDENT,
      {
        pathParams: { id },
      },
    );
  }
}
