import { ASTNode, Visitor, Expr, ASTPrinter } from "./Expr";
import { Token } from "./Token";
import { TokenType } from "./TokenType";

const { Binary, Grouping, Literal, Unary } = ASTNode;

describe("Expr", () => {
    it("Can construct a Binary Expr", () => {
        const expr = new Binary(
            new Literal(),
            new Token(TokenType.AND, "and", null, 1),
            new Literal());

        expect(expr).toEqual({
            left: {},
            operator: new Token(TokenType.AND, "and", null, 1),
            right: {}
        })
    })

    it("Can visit a simple Binary Expr", () => {
        const expr = new Binary(
            new Literal(),
            new Token(TokenType.AND, "and", null, 1),
            new Literal());

        expect(new ASTPrinter().print(expr)).toBe("(and nil nil)");
    });

    it("Can visit a complex Binary Expr", () => {
        const expr2 = new Binary(
            new Unary(
                new Token(TokenType.MINUS, "-", null, 1),
                new Literal(123)),
            new Token(TokenType.STAR, "*", null, 1),
            new Grouping(
                new Literal(45.67)));

        expect(new ASTPrinter().print(expr2)).toBe("(* (- 123) (group 45.67))");
    })

    it("Challenge, Chapter 5 #3 RPN printer", () => {
        // TODO: Extract this to a different file
        class RPNPrinter implements Visitor<string> {
            print(expr: Expr): string {
                return expr.accept(this);
            }

            rpnify(name: string, ...exprs: Expr[]) {
                let output: string[] = [];

                output = exprs.map(expr => expr.accept(this));
                output.push(name);

                return output.join(" ");
            }

            visitBinaryExpr(expr: typeof Binary) {
                return this.rpnify(expr.operator.lexeme, expr.left, expr.right);
            }

            visitGroupingExpr(expr: typeof Grouping) {
                // Do nothing on grouping, but recurse on the expr it contains
                return expr.expression.accept(this);
            }

            visitLiteralExpr(expr: typeof Literal) {
                // TODO: Undefined?
                if (expr.value == null) return "nil";
                return expr.value.toString();
            }

            visitUnaryExpr(expr: typeof Unary) {
                return this.rpnify(expr.operator.lexeme, expr.right);
            }
        }


        // (1 + 2) * (4 - 3)
        const expr = new Binary(
            new Grouping(
                new Binary(
                    new Literal(1),
                    new Token(TokenType.PLUS, "+", null, 1),
                    new Literal(2)
                )
            ),
            new Token(TokenType.STAR, "*", null, 1),
            new Grouping(
                new Binary(
                    new Literal(4),
                    new Token(TokenType.MINUS, "-", null, 1),
                    new Literal(3)
                )
            ));

        expect(new RPNPrinter().print(expr)).toBe("1 2 + 4 3 - *");
    })
});
