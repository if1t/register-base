import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function updatePrefix(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    tree.visit((filePath) => {
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
        const newContent = content.replace(/['"`]sma-/g, (match) =>
          match.replace('sma-', 'sproc-')
        );

        if (content !== newContent) {
          tree.overwrite(filePath, newContent);
        }
      }
    });

    return tree;
  };
}
