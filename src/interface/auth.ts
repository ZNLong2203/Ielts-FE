export interface ILogin {
    email: string,
    password: string,
}

export interface IStudentRegister {
    full_name: string,
    email: string,
    password: string,
    role: string
}

export interface ITeacherRegister {
    full_name: string
    email: string,
    phone: string,
    date_of_birth: Date,
    password: string,
    gender: string,
    country: string,
    qualification: string,
    experience_years: number,
    specializations: string[],
    ielts_band_score: number,
}