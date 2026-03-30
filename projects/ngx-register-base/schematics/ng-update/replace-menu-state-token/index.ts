import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { hasFileExtension, shouldSkipFile } from '../../utils/utils';

export function replaceMenuStateToken(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const tokenRegex = /\bMENU_STATE_SERVICE\b/g;
    const newToken = 'PAGE_MENU_STATE';

    tree.visit((filePath) => {
      if (shouldSkipFile(filePath) || !hasFileExtension(filePath, ['.ts'])) {
        return;
      }

      const buffer = tree.read(filePath);
      if (!buffer) {
        return;
      }

      const content = buffer.toString('utf-8');

      if (tokenRegex.test(content)) {
        const updatedContent = content.replace(tokenRegex, newToken);

        if (content !== updatedContent) {
          tree.overwrite(filePath, updatedContent);
          context.logger.info(`Updated token in: ${filePath}`);
        }
      }
    });

    return tree;
  };
}
