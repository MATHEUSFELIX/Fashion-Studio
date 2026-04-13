export const routes = {
  workspace: "/",
  createDesign: "/designs/new",
  designDetail: (id = ":designId") => `/designs/${id}`,
  variations: (id = ":designId") => `/designs/${id}/variations`,
  photoshoot: (id = ":designId") => `/designs/${id}/photoshoot`,
  technicalFlat: (id = ":designId") => `/designs/${id}/flat`,
  scoring: (id = ":designId") => `/designs/${id}/score`,
  review: (id = ":designId") => `/designs/${id}/score`,
  collections: "/collections",
  assets: "/assets",
  exports: "/exports",
  models: "/models",
};
