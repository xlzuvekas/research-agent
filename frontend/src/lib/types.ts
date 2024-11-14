
export interface Section { title: string; content: string; idx: number }

export type Sources = Record<string, Record<string, string | number>>

// This interface corresponds to the state defined in agent/state.py
export interface ResearchState {
    title: string;
    outline: Record<string, unknown>;
    intro: string;
    sections: Section[]; // Array of objects with 'title', 'content', and 'idx'
    conclusion: string;
    footnotes: string;
    sources: Sources; // Dictionary with string keys and nested dictionaries
    cited_sources: Record<keyof Sources, string[]>; // Dictionary with string keys and an array of strings
    tool: string;
    messages: { [key: string]: unknown }[]; // Array of AnyMessage objects with potential additional properties
}
