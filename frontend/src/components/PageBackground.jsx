import { DECO_IMGS } from "./Decorations";

const LAYOUTS = [
  // seed 0 — Decks
  [
    { img:"star",    s:36, d:0,   t:"4%",   l:"2%"  },
    { img:"book",    s:44, d:0.5, t:"10%",  l:"8%"  },
    { img:"globe",   s:48, d:1.1, t:"3%",   l:"22%" },
    { img:"rainbow", s:52, d:0.3, t:"6%",   r:"6%"  },
    { img:"balloon", s:38, d:1.4, t:"14%",  r:"14%" },
    { img:"sun",     s:50, d:0.8, t:"2%",   r:"28%" },
    { img:"sparkle", s:30, d:0.2, t:"28%",  l:"2%"  },
    { img:"flower",  s:42, d:1.6, t:"32%",  l:"14%" },
    { img:"music",   s:34, d:0.6, t:"40%",  r:"3%"  },
    { img:"heart",   s:36, d:1.0, t:"44%",  r:"14%" },
    { img:"pencil",  s:32, d:0.4, t:"52%",  l:"4%"  },
    { img:"ramen",   s:46, d:1.8, t:"56%",  r:"26%" },
    { img:"trophy",  s:42, d:0.9, b:"26%",  l:"2%"  },
    { img:"crown",   s:38, d:1.3, b:"20%",  l:"18%" },
    { img:"diamond", s:32, d:0.7, b:"16%",  r:"4%"  },
    { img:"cloud",   s:48, d:2.0, b:"10%",  r:"18%" },
    { img:"moon",    s:40, d:1.5, b:"6%",   l:"36%" },
    { img:"medal",   s:36, d:0.1, b:"18%",  r:"36%" },
    { img:"note",    s:38, d:1.2, b:"4%",   l:"10%" },
    { img:"book",    s:42, d:0.6, b:"28%",  r:"46%" },
  ],
  // seed 1 — Cards
  [
    { img:"heart",   s:40, d:0,   t:"4%",   l:"2%"  },
    { img:"star",    s:36, d:0.6, t:"10%",  l:"14%" },
    { img:"sparkle", s:34, d:1.2, t:"3%",   l:"28%" },
    { img:"balloon", s:42, d:0.4, t:"6%",   r:"5%"  },
    { img:"rainbow", s:50, d:1.5, t:"12%",  r:"18%" },
    { img:"flower",  s:42, d:0.8, t:"2%",   r:"32%" },
    { img:"crown",   s:38, d:0.2, t:"28%",  l:"2%"  },
    { img:"music",   s:34, d:1.7, t:"34%",  l:"16%" },
    { img:"globe",   s:46, d:0.5, t:"36%",  r:"3%"  },
    { img:"sun",     s:48, d:1.0, t:"42%",  r:"16%" },
    { img:"book",    s:44, d:0.3, t:"50%",  l:"5%"  },
    { img:"pencil",  s:32, d:1.4, t:"56%",  r:"28%" },
    { img:"ramen",   s:46, d:1.9, b:"24%",  l:"3%"  },
    { img:"trophy",  s:42, d:0.7, b:"18%",  r:"5%"  },
    { img:"moon",    s:38, d:1.1, b:"12%",  l:"33%" },
    { img:"cloud",   s:50, d:0.4, b:"8%",   r:"22%" },
    { img:"diamond", s:32, d:2.2, b:"4%",   l:"50%" },
    { img:"medal",   s:36, d:0.9, b:"26%",  r:"38%" },
    { img:"note",    s:38, d:1.6, b:"16%",  r:"50%" },
    { img:"star",    s:34, d:0.3, b:"4%",   l:"14%" },
  ],
  // seed 2 — Hangul
  [
    { img:"globe",   s:50, d:0,   t:"3%",   l:"3%"  },
    { img:"rainbow", s:54, d:0.7, t:"8%",   l:"16%" },
    { img:"star",    s:36, d:1.3, t:"2%",   r:"4%"  },
    { img:"book",    s:44, d:0.4, t:"12%",  r:"16%" },
    { img:"sun",     s:48, d:1.6, t:"2%",   r:"30%" },
    { img:"flower",  s:42, d:0.2, t:"22%",  l:"2%"  },
    { img:"balloon", s:38, d:1.0, t:"28%",  l:"15%" },
    { img:"sparkle", s:30, d:0.5, t:"34%",  r:"3%"  },
    { img:"heart",   s:36, d:1.8, t:"40%",  r:"14%" },
    { img:"music",   s:34, d:0.8, t:"46%",  l:"6%"  },
    { img:"crown",   s:40, d:1.2, t:"52%",  r:"28%" },
    { img:"pencil",  s:32, d:0.3, t:"58%",  l:"18%" },
    { img:"ramen",   s:46, d:1.5, b:"24%",  l:"4%"  },
    { img:"trophy",  s:42, d:0.6, b:"18%",  r:"5%"  },
    { img:"diamond", s:32, d:2.0, b:"12%",  l:"33%" },
    { img:"cloud",   s:48, d:1.1, b:"6%",   r:"20%" },
    { img:"moon",    s:40, d:0.9, b:"4%",   l:"50%" },
    { img:"medal",   s:36, d:1.4, b:"20%",  r:"36%" },
    { img:"note",    s:38, d:0.1, b:"28%",  r:"48%" },
    { img:"book",    s:42, d:1.7, b:"8%",   l:"16%" },
  ],
  // seed 3 — Phonetic Search
  [
    { img:"music",   s:42, d:0,   t:"4%",   l:"4%"  },
    { img:"note",    s:38, d:0.6, t:"10%",  l:"18%" },
    { img:"star",    s:36, d:1.2, t:"3%",   r:"6%"  },
    { img:"balloon", s:42, d:0.3, t:"14%",  r:"18%" },
    { img:"rainbow", s:52, d:1.5, t:"2%",   r:"33%" },
    { img:"sparkle", s:30, d:0.8, t:"24%",  l:"3%"  },
    { img:"flower",  s:42, d:0.2, t:"30%",  l:"16%" },
    { img:"globe",   s:48, d:1.7, t:"26%",  r:"4%"  },
    { img:"sun",     s:48, d:1.0, t:"36%",  r:"16%" },
    { img:"heart",   s:36, d:0.4, t:"44%",  l:"5%"  },
    { img:"book",    s:44, d:1.3, t:"50%",  r:"28%" },
    { img:"crown",   s:38, d:0.7, t:"56%",  l:"20%" },
    { img:"ramen",   s:46, d:1.9, b:"22%",  l:"4%"  },
    { img:"trophy",  s:42, d:0.5, b:"16%",  r:"6%"  },
    { img:"pencil",  s:32, d:1.1, b:"10%",  l:"36%" },
    { img:"cloud",   s:50, d:2.1, b:"6%",   r:"24%" },
    { img:"moon",    s:40, d:1.6, b:"4%",   l:"53%" },
    { img:"diamond", s:32, d:0.9, b:"26%",  r:"38%" },
    { img:"medal",   s:36, d:1.4, b:"18%",  r:"50%" },
    { img:"star",    s:34, d:0.2, b:"4%",   l:"18%" },
  ],
];

export function PageBackground({ seed = 0 }) {
  const items = LAYOUTS[seed % LAYOUTS.length];
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      overflow: "hidden",
    }}>
      {items.map((item, i) => (
        <img
          key={i}
          src={DECO_IMGS[item.img]}
          alt=""
          style={{
            position: "absolute",
            width:  item.s,
            height: item.s,
            top:    item.t,
            left:   item.l,
            right:  item.r,
            bottom: item.b,
            animation: `float 3s ease-in-out ${item.d}s infinite`,
            pointerEvents: "none",
            userSelect: "none",
            opacity: 0.82,
            display: "block",
            objectFit: "contain",
          }}
        />
      ))}
    </div>
  );
}
