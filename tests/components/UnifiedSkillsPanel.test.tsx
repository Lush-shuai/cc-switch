import { createRef } from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import UnifiedSkillsPanel, {
  type UnifiedSkillsPanelHandle,
} from "@/components/skills/UnifiedSkillsPanel";

const scanUnmanagedMock = vi.fn();
const toggleSkillAppMock = vi.fn();
const uninstallSkillMock = vi.fn();
const importSkillsMock = vi.fn();
const installFromZipMock = vi.fn();
const deleteSkillBackupMock = vi.fn();
const restoreSkillBackupMock = vi.fn();
let installedSkillsMock: Array<{
  id: string;
  name: string;
  description?: string;
  directory: string;
  repoOwner?: string;
  repoName?: string;
  apps: {
    claude: boolean;
    codex: boolean;
    gemini: boolean;
    opencode: boolean;
    openclaw: boolean;
    hermes: boolean;
  };
  installedAt: number;
  updatedAt: number;
}> = [];

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = vi.fn();
}

if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

vi.mock("@/hooks/useSkills", () => ({
  useInstalledSkills: () => ({
    data: installedSkillsMock,
    isLoading: false,
  }),
  useSkillBackups: () => ({
    data: [],
    refetch: vi.fn(),
    isFetching: false,
  }),
  useDeleteSkillBackup: () => ({
    mutateAsync: deleteSkillBackupMock,
    isPending: false,
  }),
  useToggleSkillApp: () => ({
    mutateAsync: toggleSkillAppMock,
  }),
  useRestoreSkillBackup: () => ({
    mutateAsync: restoreSkillBackupMock,
    isPending: false,
  }),
  useUninstallSkill: () => ({
    mutateAsync: uninstallSkillMock,
  }),
  useScanUnmanagedSkills: () => ({
    data: [
      {
        directory: "shared-skill",
        name: "Shared Skill",
        description: "Imported from Claude",
        foundIn: ["claude"],
        path: "/tmp/shared-skill",
      },
    ],
    refetch: scanUnmanagedMock,
  }),
  useImportSkillsFromApps: () => ({
    mutateAsync: importSkillsMock,
  }),
  useInstallSkillsFromZip: () => ({
    mutateAsync: installFromZipMock,
  }),
  useCheckSkillUpdates: () => ({
    data: [],
    refetch: vi.fn(),
    isFetching: false,
  }),
  useUpdateSkill: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe("UnifiedSkillsPanel", () => {
  beforeEach(() => {
    installedSkillsMock = [];
    scanUnmanagedMock.mockResolvedValue({
      data: [
        {
          directory: "shared-skill",
          name: "Shared Skill",
          description: "Imported from Claude",
          foundIn: ["claude"],
          path: "/tmp/shared-skill",
        },
      ],
    });
    toggleSkillAppMock.mockReset();
    uninstallSkillMock.mockReset();
    importSkillsMock.mockReset();
    installFromZipMock.mockReset();
    deleteSkillBackupMock.mockReset();
    restoreSkillBackupMock.mockReset();
  });

  it("opens the import dialog without crashing when app toggles render", async () => {
    const ref = createRef<UnifiedSkillsPanelHandle>();

    render(
      <UnifiedSkillsPanel
        ref={ref}
        onOpenDiscovery={() => {}}
        currentApp="claude"
      />,
    );

    await act(async () => {
      await ref.current?.openImport();
    });

    await waitFor(() => {
      expect(screen.getByText("skills.import")).toBeInTheDocument();
      expect(screen.getByText("Shared Skill")).toBeInTheDocument();
      expect(screen.getByText("/tmp/shared-skill")).toBeInTheDocument();
    });
  });

  it("filters installed skills by search query and repo group", async () => {
    installedSkillsMock = [
      {
        id: "1",
        name: "Browser Control",
        description: "Open and inspect browser pages",
        directory: "browser-control",
        repoOwner: "openai",
        repoName: "browser-tools",
        apps: {
          claude: true,
          codex: false,
          gemini: false,
          opencode: false,
          openclaw: false,
          hermes: false,
        },
        installedAt: 1,
        updatedAt: 1,
      },
      {
        id: "2",
        name: "Lark Calendar",
        description: "Manage meetings",
        directory: "lark-calendar",
        repoOwner: "lark",
        repoName: "workflows",
        apps: {
          claude: false,
          codex: true,
          gemini: false,
          opencode: false,
          openclaw: false,
          hermes: false,
        },
        installedAt: 1,
        updatedAt: 1,
      },
    ];
    const user = userEvent.setup();

    render(
      <UnifiedSkillsPanel
        onOpenDiscovery={() => {}}
        currentApp="claude"
      />,
    );

    await user.type(
      screen.getByPlaceholderText("skills.installedSearchPlaceholder"),
      "browser",
    );

    expect(screen.getByText("Browser Control")).toBeInTheDocument();
    expect(screen.queryByText("Lark Calendar")).not.toBeInTheDocument();

    await user.clear(
      screen.getByPlaceholderText("skills.installedSearchPlaceholder"),
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getAllByText("lark/workflows").at(-1)!);

    expect(screen.queryByText("Browser Control")).not.toBeInTheDocument();
    expect(screen.getByText("Lark Calendar")).toBeInTheDocument();
  });

  it("bulk toggles the current app for filtered installed skills", async () => {
    installedSkillsMock = [
      {
        id: "1",
        name: "Browser Control",
        description: "Open and inspect browser pages",
        directory: "browser-control",
        repoOwner: "openai",
        repoName: "browser-tools",
        apps: {
          claude: false,
          codex: false,
          gemini: false,
          opencode: false,
          openclaw: false,
          hermes: false,
        },
        installedAt: 1,
        updatedAt: 1,
      },
      {
        id: "2",
        name: "Lark Calendar",
        description: "Manage meetings",
        directory: "lark-calendar",
        repoOwner: "lark",
        repoName: "workflows",
        apps: {
          claude: false,
          codex: false,
          gemini: false,
          opencode: false,
          openclaw: false,
          hermes: false,
        },
        installedAt: 1,
        updatedAt: 1,
      },
      {
        id: "3",
        name: "Browser Audit",
        description: "Check browser pages",
        directory: "browser-audit",
        repoOwner: "openai",
        repoName: "browser-tools",
        apps: {
          claude: true,
          codex: false,
          gemini: false,
          opencode: false,
          openclaw: false,
          hermes: false,
        },
        installedAt: 1,
        updatedAt: 1,
      },
    ];
    const user = userEvent.setup();

    render(
      <UnifiedSkillsPanel
        onOpenDiscovery={() => {}}
        currentApp="claude"
      />,
    );

    await user.type(
      screen.getByPlaceholderText("skills.installedSearchPlaceholder"),
      "browser",
    );
    await user.click(screen.getByRole("button", { name: "skills.selectAll" }));

    expect(toggleSkillAppMock).toHaveBeenCalledTimes(1);
    expect(toggleSkillAppMock).toHaveBeenCalledWith({
      id: "1",
      app: "claude",
      enabled: true,
    });

    await user.click(
      screen.getByRole("button", { name: "skills.deselectAll" }),
    );

    expect(toggleSkillAppMock).toHaveBeenCalledTimes(3);
    expect(toggleSkillAppMock).toHaveBeenNthCalledWith(2, {
      id: "1",
      app: "claude",
      enabled: false,
    });
    expect(toggleSkillAppMock).toHaveBeenNthCalledWith(3, {
      id: "3",
      app: "claude",
      enabled: false,
    });
  });
});
