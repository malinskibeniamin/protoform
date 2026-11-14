interface RegistryDependencyItem {
  dependencies?: string[] | undefined;
  devDependencies?: string[] | undefined;
  name: string;
}

interface RegistryPackageManifest {
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string> | undefined;
}

function versionedDependency(
  dependency: string,
  item: RegistryDependencyItem,
  manifest: RegistryPackageManifest
): string {
  const versionAt = dependency.indexOf('@', dependency.startsWith('@') ? 1 : 0);
  const name = versionAt === -1 ? dependency : dependency.slice(0, versionAt);
  if (name === 'react' || name === 'react-dom') {
    return name;
  }
  if (item.name === 'protobuf-v1-bridge' && name === '@bufbuild/protobuf') {
    return `${name}@^1.10.1`;
  }
  const version = manifest.dependencies[name] ?? manifest.devDependencies?.[name];
  if (version === undefined) {
    throw new Error(`Missing tested dependency version for ${item.name}: ${name}`);
  }
  return `${name}@${version}`;
}

export function synchronizeRegistryDependencies(items: RegistryDependencyItem[], manifest: RegistryPackageManifest) {
  for (const item of items) {
    if (item.dependencies) {
      item.dependencies = item.dependencies.map((dependency) => versionedDependency(dependency, item, manifest));
    }
    if (item.devDependencies) {
      item.devDependencies = item.devDependencies.map((dependency) => versionedDependency(dependency, item, manifest));
    }
  }
}
