import { TokenType } from "./TokenType";
import { Token } from "./Token";
import { Visitor, ASTNode, Expr } from "./Expr";

export class RuntimeError extends Error {
    token: Token;

    constructor(token: Token, message: string) {
        super(message);
        this.token = token;
    }
};

export class Interpreter implements Visitor<any> {
    onOutput: (output: string) => void;
    onError: (error: RuntimeError) => void;

    // Difference: The book uses a static "error" function on the top-level
    // interpreter class. Instead we pass an error reporting function down
    // Difference: The book prints output here to stdout, but we also
    // implement a callback so the parent can define this functionality
    constructor(
        onOutput: (output: string) => void,
        onError: (error: RuntimeError) => void) {
        this.onOutput = onOutput;
        this.onError = onError;
    }

    interpret(expression: Expr) {
        try {
            const value = this.evaluate(expression);
            this.onOutput(this.stringify(value));
        } catch (error) {
            // If this is not a runtime error, don't attempt our error handling
            if (!(error instanceof RuntimeError)) throw error;
            this.onError(error);
        }
    }

    private evaluate(expr: Expr): any {
        return expr.accept(this);
    }

    private stringify(object: any): string {
        if (object === null) return "nil";

        if (typeof object === "number") {
            let text = object.toString();

            // Difference: This is a peculiarity of Java's Double type,
            // JavaScript already does this, so we don't need to do it
            // if (text.endsWith(".0")) {
            //     text = text.substring(0, text.length - 2);
            // }

            return text;
        }

        return object.toString();
    }

    private isTruthy(thing: any): boolean {
        if (thing === null) return false;
        if (typeof thing === "boolean") return thing;
        return true;
    }

    private isEqual(a: any, b: any): boolean {
        // Difference: Book uses more complicated Java logic for equality,
        // but we'll just use JS's strict equality (===)
        return a === b;
    }

    private checkNumberOperand(operator: Token, operand: any) {
        if (typeof operand === "number") return;
        throw new RuntimeError(operator, "Operand must be a number.");
    }

    private checkNumberOperands(operator: Token, left: any, right: any) {
        if (typeof left === "number" && typeof right === "number") return;
        throw new RuntimeError(operator, "Operands must be a numbers.");
    }

    visitBinaryExpr(expr: typeof ASTNode.Binary) {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right);
            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return left > right;
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left >= right;
            case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return left < right;
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left <= right;
            case TokenType.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return left - right;
            case TokenType.PLUS:
                if (typeof left === "number" && typeof right === "number") {
                    return left + right;
                }

                if (typeof left === "string" && typeof right === "string") {
                    return left + right;
                }

                throw new RuntimeError(
                    expr.operator,
                    "Operands must be two numbers or two strings.")
                break;
            case TokenType.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
                return left / right;
            case TokenType.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return left * right;
        }

        return null;
    }

    visitTernaryExpr(expr: typeof ASTNode.Binary) {
        // TODO
    }

    visitGroupingExpr(expr: typeof ASTNode.Grouping) {
        return this.evaluate(expr.expression);
    }

    visitLiteralExpr(expr: typeof ASTNode.Literal) {
        return expr.value;
    }

    visitUnaryExpr(expr: typeof ASTNode.Unary) {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.MINUS:
                this.checkNumberOperand(expr.operator, right);
                return -1 * right;
            case TokenType.BANG:
                return !this.isTruthy(right);
        }

        return null;
    }
}
