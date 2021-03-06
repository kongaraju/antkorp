/* A Bison parser, made by GNU Bison 2.5.  */

/* Bison interface for Yacc-like parsers in C
   
      Copyright (C) 1984, 1989-1990, 2000-2011 Free Software Foundation, Inc.
   
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.  */

/* As a special exception, you may create a larger work that contains
   part or all of the Bison parser skeleton and distribute that work
   under terms of your choice, so long as that work isn't itself a
   parser generator using the skeleton or a modified version thereof
   as a parser skeleton.  Alternatively, if you modify or redistribute
   the parser skeleton itself, you may (at your option) remove this
   special exception, which will cause the skeleton and the resulting
   Bison output files to be licensed under the GNU General Public
   License without this special exception.
   
   This special exception was added by the Free Software Foundation in
   version 2.2 of Bison.  */

/* "%code requires" blocks.  */

/* Line 2068 of yacc.c  */
#line 12 "parser.y"

#include "locfile.h"
#define YYLTYPE location
#define YYLLOC_DEFAULT(Loc, Rhs, N)             \
  do {                                          \
    if (N) {                                    \
      (Loc).start = YYRHSLOC(Rhs, 1).start;     \
      (Loc).end = YYRHSLOC(Rhs, N).end;         \
    } else {                                    \
      (Loc).start = YYRHSLOC(Rhs, 0).end;       \
      (Loc).end = YYRHSLOC(Rhs, 0).end;         \
    }                                           \
  } while (0)
 


/* Line 2068 of yacc.c  */
#line 55 "parser.h"

/* Tokens.  */
#ifndef YYTOKENTYPE
# define YYTOKENTYPE
   /* Put the tokens into the symbol table, so that GDB and other debuggers
      know about them.  */
   enum yytokentype {
     INVALID_CHARACTER = 258,
     IDENT = 259,
     LITERAL = 260,
     FORMAT = 261,
     EQ = 262,
     NEQ = 263,
     DEFINEDOR = 264,
     AS = 265,
     DEF = 266,
     IF = 267,
     THEN = 268,
     ELSE = 269,
     ELSE_IF = 270,
     REDUCE = 271,
     END = 272,
     AND = 273,
     OR = 274,
     SETPIPE = 275,
     SETPLUS = 276,
     SETMINUS = 277,
     SETMULT = 278,
     SETDIV = 279,
     SETDEFINEDOR = 280,
     LESSEQ = 281,
     GREATEREQ = 282,
     QQSTRING_START = 283,
     QQSTRING_TEXT = 284,
     QQSTRING_INTERP_START = 285,
     QQSTRING_INTERP_END = 286,
     QQSTRING_END = 287
   };
#endif
/* Tokens.  */
#define INVALID_CHARACTER 258
#define IDENT 259
#define LITERAL 260
#define FORMAT 261
#define EQ 262
#define NEQ 263
#define DEFINEDOR 264
#define AS 265
#define DEF 266
#define IF 267
#define THEN 268
#define ELSE 269
#define ELSE_IF 270
#define REDUCE 271
#define END 272
#define AND 273
#define OR 274
#define SETPIPE 275
#define SETPLUS 276
#define SETMINUS 277
#define SETMULT 278
#define SETDIV 279
#define SETDEFINEDOR 280
#define LESSEQ 281
#define GREATEREQ 282
#define QQSTRING_START 283
#define QQSTRING_TEXT 284
#define QQSTRING_INTERP_START 285
#define QQSTRING_INTERP_END 286
#define QQSTRING_END 287




#if ! defined YYSTYPE && ! defined YYSTYPE_IS_DECLARED
typedef union YYSTYPE
{

/* Line 2068 of yacc.c  */
#line 30 "parser.y"

  jv literal;
  block blk;



/* Line 2068 of yacc.c  */
#line 143 "parser.h"
} YYSTYPE;
# define YYSTYPE_IS_TRIVIAL 1
# define yystype YYSTYPE /* obsolescent; will be withdrawn */
# define YYSTYPE_IS_DECLARED 1
#endif



#if ! defined YYLTYPE && ! defined YYLTYPE_IS_DECLARED
typedef struct YYLTYPE
{
  int first_line;
  int first_column;
  int last_line;
  int last_column;
} YYLTYPE;
# define yyltype YYLTYPE /* obsolescent; will be withdrawn */
# define YYLTYPE_IS_DECLARED 1
# define YYLTYPE_IS_TRIVIAL 1
#endif



