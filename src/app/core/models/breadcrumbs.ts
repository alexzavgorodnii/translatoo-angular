export interface Breadcrumb {
  title: string;
  type: 'link' | 'title';
  route?: string[];
}
