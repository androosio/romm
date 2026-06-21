import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createI18n } from "vue-i18n";
import { createVuetify } from "vuetify";
import type { SimpleRom } from "@/stores/roms";
import SiblingBadge from "./SiblingBadge.vue";

// `groupRoms` is the gate for reading `sibling_roms` (its default is `true`).
// Force it on so the regression path is exercised deterministically.
vi.mock("@/composables/useUISettings", () => ({
  useUISettings: () => ({ groupRoms: { value: true } }),
}));

const vuetify = createVuetify();
const i18n = createI18n({ legacy: false, locale: "en", messages: { en: {} } });

// Mimics a `scan:scanning_rom` socket payload: the emit strips `sibling_roms`,
// so it is absent here even though `SimpleRomSchema` types it as required.
const scanRom = {
  id: 1,
  fs_name_no_ext: "Some Game",
  rom_user: null,
} as unknown as SimpleRom;

describe("SiblingBadge", () => {
  // Regression (#3567): a rom delivered over the scan socket has no
  // `sibling_roms` field; reading `.length` on it threw and crashed the
  // gallery while a scan streamed roms with "Group ROMs" enabled.
  it("renders without crashing when sibling_roms is undefined", () => {
    expect(() =>
      mount(SiblingBadge, {
        props: { rom: scanRom },
        global: { plugins: [vuetify, i18n] },
      }),
    ).not.toThrow();
  });
});
