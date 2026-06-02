import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { CodexFormFields } from "@/components/providers/forms/CodexFormFields";

vi.mock("@/components/providers/forms/CopilotAuthSection", () => ({
  CopilotAuthSection: () => <div data-testid="copilot-auth-section" />,
}));

type CodexFormFieldsProps = ComponentProps<typeof CodexFormFields>;

const renderCodexForm = (overrides: Partial<CodexFormFieldsProps> = {}) => {
  const props: CodexFormFieldsProps = {
    codexApiKey: "",
    onApiKeyChange: vi.fn(),
    category: "third_party",
    shouldShowApiKeyLink: false,
    websiteUrl: "",
    shouldShowSpeedTest: false,
    codexBaseUrl: "https://api.githubcopilot.com",
    onBaseUrlChange: vi.fn(),
    isFullUrl: false,
    onFullUrlChange: vi.fn(),
    isEndpointModalOpen: false,
    onEndpointModalToggle: vi.fn(),
    onCustomEndpointsChange: vi.fn(),
    autoSelect: false,
    onAutoSelectChange: vi.fn(),
    apiFormat: "openai_responses",
    onApiFormatChange: vi.fn(),
    speedTestEndpoints: [],
    ...overrides,
  };

  return render(<CodexFormFields {...props} />);
};

describe("CodexFormFields", () => {
  it("shows Copilot OAuth and hides API key input for Codex Copilot presets", () => {
    renderCodexForm({
      isCopilotPreset: true,
      usesOAuth: true,
      selectedGitHubAccountId: "gh-1",
      onGitHubAccountSelect: vi.fn(),
    });

    expect(screen.getByTestId("copilot-auth-section")).toBeInTheDocument();
    expect(screen.queryByLabelText("API Key")).not.toBeInTheDocument();
  });
});
