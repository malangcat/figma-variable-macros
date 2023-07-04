import Mexp from "math-expression-evaluator";

export function calculateVariables() {
  const variables = figma.variables.getLocalVariables("FLOAT");
  const variableMap = new Map<string, Variable>(
    variables.map((v) => [v.name, v])
  );
  const mexp = new Mexp();

  function evaluateVariable(name: string, modeId: string) {
    const variable = variableMap.get(name);

    if (!variable) {
      figma.notify(`Variable ${name} not found`, {
        error: true,
      });
    }

    const value = variable!.valuesByMode[modeId];
    return value;
  }

  let updatedCount = 0;
  for (const variable of variables) {
    const description = variable.description;
    const matched = description.match("%calc(.*)");
    const expression = matched ? matched[1] : null;

    if (expression) {
      const collection = figma.variables.getVariableCollectionById(
        variable.variableCollectionId
      )!;
      const modes = collection.modes;
      const usedVariables = expression.match(/{.*?}/g) || [];

      for (const mode of modes) {
        let updatedExpression = expression;
        for (const usedVariable of usedVariables) {
          const name = usedVariable.replace("{", "").replace("}", "");
          const value = evaluateVariable(name, mode.modeId);
          updatedExpression = updatedExpression.replace(
            usedVariable,
            value.toString()
          );
        }
        variable.setValueForMode(
          mode.modeId,
          mexp.eval(updatedExpression, [], {})
        );
      }

      updatedCount += 1;
    }
  }

  figma.notify(`Updated ${updatedCount} variables`);
}
