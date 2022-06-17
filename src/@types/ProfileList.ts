export interface IProfileList {
    _id:string;
    name: string;
    profile_image: string;
    age:string,
    experiences: IExperiencesList[];
}

export interface IExperiencesList {
    start_date: number,
    end_date: number,
    job_title: string,
    company: string,
    company_logo: string,
    job_description: string,
}

export interface ITableColumn {
    title: string,
    dataIndex: string,
    width: string,
    defaultSortOrder?: string | any;
    render?: (record : string | any)=> JSX.Element;
    key: string
}

export interface Experiences {
    job_title: string
    job_description: string
    company: string
    company_logog: string
    start_date: number,
    end_date: number,
}

export interface FormData {
    name: string
    profile_image: string
    age: number
    experience: Experiences []
}