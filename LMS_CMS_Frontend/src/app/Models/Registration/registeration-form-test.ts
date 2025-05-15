export class RegisterationFormTest {
     constructor(
            public id: number = 0,
            public mark:number | null = null,
            public totalMark:number | null = null,
            public visibleToParent: boolean = false,
            public testID: number = 0,
            public testName: string = '',
            public stateID: number = 0,
            public stateName: string = '',
            public subjectName: string = '',
            public registerationFormParentID: number = 0,
            public insertedByUserId: number = 0,
        ) {}
}
