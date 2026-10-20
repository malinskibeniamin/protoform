interface CommentLocation {
  end: { column: number; line: number };
  start: { column: number; line: number };
}

interface CommentContext {
  report: (diagnostic: { loc: CommentLocation; messageId: string }) => void;
  sourceCode: {
    getAllComments: () => { loc: CommentLocation; range: [number, number] }[];
    text: string;
  };
}

export default {
  meta: { name: 'protoform' },
  rules: {
    'no-comments': {
      meta: {
        type: 'problem',
        schema: [],
        messages: { forbidden: 'Remove the comment; name the code so it explains itself.' },
      },
      create(context: CommentContext) {
        return {
          Program() {
            const { sourceCode } = context;
            for (const comment of sourceCode.getAllComments()) {
              if (comment.range[0] === 0 && sourceCode.text.startsWith('#!')) {
                continue;
              }
              context.report({ loc: comment.loc, messageId: 'forbidden' });
            }
          },
        };
      },
    },
  },
};
