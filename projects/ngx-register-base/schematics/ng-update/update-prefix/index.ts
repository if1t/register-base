import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { hasFileExtension, shouldSkipFile } from '../../utils/utils';

export function updatePrefix(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    tree.visit((filePath) => {
      if (shouldSkipFile(filePath)) {
        return;
      }

      const contentBuffer = tree.read(filePath);
      if (!contentBuffer) {
        return;
      }

      const content = contentBuffer.toString('utf-8');

      if (hasFileExtension(filePath, ['.html', '.ts'])) {
        const newContent = content.replace(/<sma-/g, '<sproc-').replace(/<\/sma-/g, '</sproc-');

        if (content !== newContent) {
          tree.overwrite(filePath, newContent);
        }
        return;
      }

      if (hasFileExtension(filePath, ['.css', '.less', '.scss'])) {
        const newContent = content.replace(/\bsma-/g, 'sproc-');

        if (content !== newContent) {
          tree.overwrite(filePath, newContent);
        }
      }
    });

    return tree;
  };
}
