import { DirectMarkClasses } from "./direct-mark-classes";
import { DirectMarkClassesStudent } from "./direct-mark-classes-student";

export class DirectMark {
     constructor(
            public id: number = 0,
            public englishName: string = '',
            public arabicName: string = '',
            public mark: number = 0,
            public date: string = '',
            public subjectEnglishName: string = '',
            public subjectArabicName: string = '',
            public subjectID: number = 0,
            public schoolName: string = '',
            public schoolID: number = 0,
            public gradeName: string = '',
            public gradeID: number = 0,
            public allClasses: boolean = false,
            public subjectWeightTypeID: number = 0,
            public subjectWeightTypeEnglishName: string = '',
            public subjectWeightTypeArabicName: string = '',
            public directMarkClassesStudent: DirectMarkClassesStudent[] = [],
            public directMarkClasses: DirectMarkClasses[] = [],
            public classids: number[] = [],
            public insertedByUserId: number = 0,
            public insertedByUserName: string = ''
        ) { }
}
