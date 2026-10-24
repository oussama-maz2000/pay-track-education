import { RoleDto } from "../model/role.model";
import { Option } from "../../shared/components/form/select/select.component";
import { Branch } from "../model/branch.model";
import { SubjectDto } from "../model/subjects.model";
import { Unit } from "../model/unit.model";
import { LessonDto } from "../model/lesson.model";

export const mapRolesToOptions = (roles: RoleDto[]): Option[] =>
  roles.map((role) => ({
    value: role.id,
    label: role.name.replace("ROLE_", ""),
  }));

export const mapBranchOptions = (branch: Branch[]): Option[] =>
  branch.map((branch) => ({
    value: branch.id,
    label: branch.name,
  }));

export const mapSubjectOptions = (subject: SubjectDto[]): Option[] =>
  subject.map((subject) => {
    return {
      value: subject.id,
      label: subject.name,
    };
  });

export const mapUnitOptions = (unit: Unit[]): Option[] =>
  unit.map((unit) => {
    return {
      value: unit.id,
      label: unit.name,
    };
  });

export const mapLessonOptions = (lesson: LessonDto[]): Option[] =>
  lesson.map((lesson) => {
    return {
      value: lesson.id,
      label: lesson.name,
    };
  });
