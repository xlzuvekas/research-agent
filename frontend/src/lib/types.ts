
export interface Section { title: string; content: string; idx: number }

export interface Source {
    content: string;
    published_date: string;
    score: number;
    title: string;
    url: string;
}
export type Sources = Record<string, Source>

export interface Log {
    message: string;
    done: boolean;
}

// This interface corresponds to the state defined in agent/state.py
export interface ResearchState {
    title: string;
    outline: Record<string, unknown>;
    intro: string;
    sections: Section[]; // Array of objects with 'title', 'content', and 'idx'
    conclusion: string;
    // TODO: needs to be a list of footnotes maybe?
    footnotes: string;
    sources: Sources; // Dictionary with string keys and nested dictionaries
    cited_sources: Record<keyof Sources, string[]>; // Dictionary with string keys and an array of strings
    tool: string;
    messages: { [key: string]: unknown }[]; // Array of AnyMessage objects with potential additional properties
    logs: Log[];
}

export type Document = Pick<ResearchState, 'sections' | 'title' | 'intro' | 'outline' | 'footnotes' | 'conclusion' | 'cited_sources'>
