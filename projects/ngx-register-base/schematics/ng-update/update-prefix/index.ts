import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function updatePrefix(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    tree.visit((filePath) => {
      if (
        filePath.includes('/node_modules/') ||
        filePath.includes('/dist/') ||
        filePath.includes('/.angular/') ||
        filePath.includes('/.git/')
      ) {
        return;
      }

      const contentBuffer = tree.read(filePath);
      if (!contentBuffer) {
        return;
      }

      const content = contentBuffer.toString('utf-8');

      if (filePath.endsWith('.html') || filePath.endsWith('.ts')) {
        const newContent = content.replace(/<sma-/g, '<sproc-').replace(/<\/sma-/g, '</sproc-');

        if (content !== newContent) {
          tree.overwrite(filePath, newContent);
        }
        return;
      }

      if (filePath.endsWith('.css') || filePath.endsWith('.less') || filePath.endsWith('.scss')) {
        const newContent = content.replace(/\bsma-/g, 'sproc-');

        if (content !== newContent) {
          tree.overwrite(filePath, newContent);
        }
      }
    });

    return tree;
  };
}
