export type Candidate = {
  token: string;
  probability: number;
};

export type GenerationStep = {
  candidates: Candidate[];
  chosenIndex: number;
};

export type PresetPrompt = {
  id: string;
  label: string;
  prompt: string;
};

export type GenerationStatus = "idle" | "generating" | "finished";
