export type OpenAIThead = {
  id: string;
  object: string;
  created_at: number;
  metadata: object;
  tool_resources: object;
};

export type OpenAIToolOutput = {
  tool_call_id: string;
  output: string;
}
