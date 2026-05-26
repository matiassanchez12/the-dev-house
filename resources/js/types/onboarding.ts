export interface SaveStep1Data {
    techs: Array<{
        id: number;
        proficiency: number;
    }>;
}

export interface SaveStep2Data {
    bio: string | null;
}

export interface SaveStep3Data {
    avatar: File | null;
}

export interface SaveStep4Data {
    join_requests: number[];
}
