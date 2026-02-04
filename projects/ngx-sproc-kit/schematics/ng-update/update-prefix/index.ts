import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function updatePrefix(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    tree.visit((filePath) => {
      if (!filePath.endsWith('.html') && !filePath.endsWith('.ts')) {
        return;
      }

      const contentBuffer = tree.read(filePath);

      if (!contentBuffer) {
        return;
      }

      const content = contentBuffer.toString('utf-8');
      let newContent = content.replace(/<sma-/g, '<sproc-').replace(/<\/sma-/g, '</sproc-');

      if (filePath.endsWith('.ts')) {
        newContent = newContent.replace(/['"`]sma-/g, (match) => match.replace('sma-', 'sproc-'));
      }

      if (content !== newContent) {
        tree.overwrite(filePath, newContent);
      }
    });

    return tree;
  };
}
