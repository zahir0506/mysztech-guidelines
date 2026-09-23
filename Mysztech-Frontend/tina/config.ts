import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "guidelines",
        label: "Panduan MYSZTECH",
        path: "content/guidelines",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Tajuk Artikel",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "section",
            label: "Kumpulan Utama (Cth: USER GUIDELINES, SUPPORT)",
            options: [
              // ==========================================
              // KEMAS KINI: TAMBAH PILIHAN PROLOGUE
              // ==========================================
              { label: "PROLOGUE", value: "PROLOGUE" },
              { label: "USER GUIDELINES", value: "USER GUIDELINES" },
              { label: "SUPPORT", value: "SUPPORT" }
            ],
            required: true,
          },
          {
            type: "number",
            name: "order",
            label: "Nombor Susunan (Cth: 1, 2, 4.5)",
          },
          {
            type: "boolean",
            name: "isSubTopic",
            label: "Adakah ini Sub-Topik?",
          },
          {
            type: "string",
            name: "parentTopic",
            label: "Nama Topik Induk (Cth: 4. Sales)",
          },
          {
            type: "string",
            name: "language",
            label: "Bahasa",
            options: [
              { label: "English", value: "en" },
              { label: "Bahasa Melayu", value: "bm" }
            ],
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Isi Panduan",
            isBody: true,
            templates: [
              {
                name: "KotakInfo",
                label: "Kotak Info (Biru/Oren)",
                fields: [
                  {
                    name: "jenis",
                    label: "Warna Kotak",
                    type: "string",
                    options: [
                      { label: "Biru", value: "biru" },
                      { label: "Oren", value: "oren" }
                    ],
                    required: true,
                  },
                  {
                    name: "kandungan",
                    label: "Isi Kotak",
                    type: "rich-text"
                  }
                ],
              }
            ],
          },
        ],
      },
    ],
  },
});