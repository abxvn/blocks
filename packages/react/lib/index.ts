export async function unpackLazy (componentLazy: Promise<any>, groupedComponentName?: string): Promise<any> {
  const component = await componentLazy

  return groupedComponentName !== undefined
    ? { default: component[groupedComponentName] }
    : component
}
