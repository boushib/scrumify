export interface Story {
    id: string;
    title: string;
    status: StoryStatus;
    assignee: string;
    description: string;
}
export declare enum StoryStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
}
