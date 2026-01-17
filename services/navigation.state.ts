let currentPath = "";

export const navigationState = {
  setPath(path: string) {
    currentPath = path;
  },
  getPath() {
    return currentPath;
  },
};
