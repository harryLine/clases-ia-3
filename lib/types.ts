export type ResourceLink = {
  id: string
  name: string
  url: string
}

export type ClassNote = {
  id: string
  date: string
  title: string
  contentHtml: string
  resources: ResourceLink[]
  updatedAt: string
}
