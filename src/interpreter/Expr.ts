//
//
// Difference from the book:
// Instead of writing a new file with all the class declarations, use eval
// to generate all of those classes at runtime.
//
//
//
// TODO:
// By generating the ASTNode classes at runtime, we lose compile time checks
// that a given Visitor will implement a visit method for each ASTNode class.
// I don't see any way around this except converting to the same meta pipeline
// for generating the script file as Nystrom uses.
//
// @ts-ignore "R is unused," but we don't care since implementors will use it
export interface Visitor<R> { }
export interface ExprVisitor<R> { }
export interface StmtVisitor<R> { }

export abstract class Expr {
    abstract accept<R>(visitor: ExprVisitor<R>): R;
}

export abstract class Stmt {
    abstract accept<R>(visitor: StmtVisitor<R>): R;
}

// Fancy type to allow arbitrary children of Expr not known at compile time
type ASTNodeType<A extends Expr = any> = {
    [s in string]: A
};

// TODO Rename ASTNode to "ExprNode"
export const ASTNode: ASTNodeType = {};
defineAst("Expr", ASTNode, {
    "Binary": ["left", "operator", "right"],
    "Ternary": ["left", "middle", "right"],
    "Grouping": ["expression"],
    "Literal": ["value"],
    "Unary": ["operator", "right"]
})

export const StmtNode: ASTNodeType = {};
defineAst("Stmt", StmtNode, {
    "Expression": ["expression"],
    "Print": ["expression"]
})

type ClassName = string;
type Fields = string[];

function defineAst(baseName: string, container: ASTNodeType, classes: { [s in ClassName]: Fields }) {
    Object.entries(classes).forEach(([name, fields]) => {
        const clazz = defineAstNode(baseName, name, fields);

        // Add a static member of the main export Expr, so we can access this
        // constructor from elsewhere
        container[name] = clazz;
    });
}

function defineAstNode(baseName: string, className: ClassName, fields: Fields) {
    const memberDeclarations = fields.map(
        (name) => `${name};`)
        .join("\n");

    const constructorParameters = fields.map(
        (name) => `${name}`)
        .join(", ");

    const memberAssignments = fields.map(
        (name) => `this.${name} = ${name};`)
        .join("\n");

    const visitorMethodName = `visit${className}${baseName}`

    const classSource = `
        class ${className} extends ${baseName} {
            ${memberDeclarations}

            constructor(${constructorParameters}) {
                super();
                ${memberAssignments}
            }

            accept(visitor) {
                return visitor.${visitorMethodName}(this);
            }
        }

        // Final thing in eval should be an expression
        // so that the return value is the class we just defined
        ${className}
    `;

    //@ts-ignore Yes I know eval can be harmful. Don't try this at home.
    return eval(classSource);
}

export class ASTPrinter implements Visitor<string> {
    print(expr: Expr): string {
        return expr.accept(this);
    }

    parenthesize(name: string, ...exprs: Expr[]) {
        let output: string[] = [];

        output.push("(")
        output.push(name)

        exprs.forEach(expr => {
            output.push(" ");
            output.push(expr.accept(this));
        })

        output.push(")");

        return output.join("");
    }

    visitBinaryExpr(expr: typeof ASTNode.Binary) {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }

    visitTernaryExpr(expr: typeof ASTNode.Binary) {
        return this.parenthesize("ternary", expr.left, expr.middle, expr.right);
    }

    visitGroupingExpr(expr: typeof ASTNode.Grouping) {
        return this.parenthesize("group", expr.expression);
    }

    visitLiteralExpr(expr: typeof ASTNode.Literal) {
        // TODO: Undefined?
        if (expr.value == null) return "nil";
        return expr.value.toString();
    }

    visitUnaryExpr(expr: typeof ASTNode.Unary) {
        return this.parenthesize(expr.operator.lexeme, expr.right);
    }
}
