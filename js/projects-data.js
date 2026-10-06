/**
 * Portfolio Game Projects Data for Mohamed Aman
 * Game Developer & Gameplay Programmer | B.Tech CS Graduate
 * Currently on course in EXR School of Game Dev | Specializing in Unreal Engine 5 & C++
 */

const portfolioProjects = [
  {
    id: "outbreak-last-stand",
    title: "Outbreak: Last Stand",
    subtitle: "Solo Third-Person Zombie Survival in Unreal Engine 5",
    category: "unreal",
    categoryLabel: "Unreal Engine 5",
    badge: "Solo In-Development",
    thumbnail: "assets/project-outbreak.jpg",
    bannerGradient: "linear-gradient(135deg, #180307 0%, #300612 50%, #4c0519 100%)",
    accentColor: "#f43f5e",
    role: "Solo Game Developer & Gameplay Programmer",
    teamSize: "Solo Project",
    duration: "In Active Development",
    engine: "Unreal Engine 5 (Enhanced Input, C++, Blueprints, Niagara)",
    status: "In Active Development",
    tags: ["Unreal Engine 5", "Zombie Survival", "C++ & Blueprints", "Horde AI", "Niagara VFX", "Enhanced Input"],
    shortDesc: "Stand your ground against relentless swarms of mutated infected and hulking brutes. Solo Unreal Engine 5 action survival with tactical weapon ballistics, sound-based aggro propagation, and EQS horde AI.",
    links: {
      github: "https://github.com",
      itch: "https://itch.io",
      playUrl: null,
      video: null
    },
    overview: `Outbreak: Last Stand is an atmospheric third-person action survival game currently being developed solo in Unreal Engine 5. Players are placed in a quarantined urban sector overrun by dynamic infected hordes. The game emphasizes tactical ammo conservation, barricade defense, responsive character locomotion, and situational awareness through environmental audio.`,
    highlights: [
      "Dynamic Horde Spawning & Pathfinding: Utilizing Unreal Engine 5 Navigation Meshes and EQS (Environment Query System) to simulate relentless swarm behaviors that flank and trap the player.",
      "C++ Weapon Mechanics: Custom ballistics pipeline featuring progressive recoil curves, bullet dispersion cones, physical impact decal spawning, and pooled muzzle flash particles.",
      "Audio-Driven Enemy Perception: Sound stimulation system where gunfire and sprint footsteps broadcast noise vectors that attract nearby infected within hearing radii.",
      "Modern Unreal Engine 5 Visuals: Lumen global illumination, volumetric fog, and Niagara blood splatter and weapon smoke VFX tuned for stable 60+ FPS performance."
    ],
    technicalDeepDive: {
      heading: "C++ Recoil Compensation & Weapon Fire Pipeline",
      explanation: "Weapon handling is built around a deterministic C++ fire loop that manages rate of fire, ammo count, camera shake impulses, and dynamic crosshair spread expansion based on player movement velocity.",
      codeSnippet: `// Weapon Fire & Trace Execution in C++
void AOutbreakWeapon::FireWeaponTrace() {
    if (!CanFire()) return;

    FVector StartTrace = WeaponMesh->GetSocketLocation(MuzzleSocketName);
    FRotator AimRotator = GetPawnOwnerAimRotation();
    
    // Calculate dynamic spread based on player velocity & stance
    float CurrentSpread = CalculateCurrentSpreadAngle();
    FVector AimDir = ApplySpreadToAim(AimRotator.Vector(), CurrentSpread);
    FVector EndTrace = StartTrace + (AimDir * MaxWeaponRange);

    FHitResult HitResult;
    FCollisionQueryParams QueryParams(SCENE_QUERY_STAT(WeaponTrace), true, GetInstigator());
    
    if (GetWorld()->LineTraceSingleByChannel(HitResult, StartTrace, EndTrace, ECC_GameTraceChannel_Weapon, QueryParams)) {
        ApplyDamageAndImpactDecal(HitResult);
    }
    
    // Broadcast sound impulse to alert nearby zombie AI controllers
    BroadcastNoiseEvent(StartTrace, GunshotNoiseLoudness, GunshotNoiseRange);
    PlayFireEffects();
}`
    }
  },
  {
    id: "high-tide",
    title: "High Tide",
    subtitle: "Challenging 3D Maze Platformer in Unreal Engine",
    category: "unreal",
    categoryLabel: "Unreal Engine",
    badge: "Game Jam Team Project",
    thumbnail: "assets/project-high-tide.jpg",
    bannerGradient: "linear-gradient(135deg, #031525 0%, #072e4a 50%, #0c4a6e 100%)",
    accentColor: "#0ea5e9",
    role: "Gameplay Programmer & Systems Designer",
    teamSize: "Game Jam Team",
    duration: "Game Jam Project",
    engine: "Unreal Engine (Blueprints & C++)",
    status: "Completed Game Jam Project",
    tags: ["Unreal Engine", "Game Jam", "Maze Platformer", "Precision Traversal", "Parkour Mechanics", "Ledge Grab"],
    shortDesc: "Climb. Survive. Reach. An intense 3D maze platformer created for a Game Jam. Navigate perilous vertical ruins, master high-stakes jumps, control your anger, and find the escape route to beat the game.",
    links: {
      github: "https://github.com",
      itch: "https://itch.io",
      playUrl: null,
      video: null
    },
    overview: `High Tide is an intense, precision 3D maze platformer designed and developed under strict Game Jam deadlines with a collaborative team in Unreal Engine. Set within a massive, dilapidated coastal labyrinth surrounded by open waters, players must find their way through an unforgiving vertical maze. Success requires pinpoint jumping accuracy, mastery of ledge-mantling traversal, patience, and absolute emotional control—one wrong step or hasty leap can send you tumbling back down or trapped in a dead end.`,
    highlights: [
      "Precision 3D Maze Navigation: Complex, multi-tiered labyrinth design filled with deceptive dead ends, narrow beams, and vertical ascension routes.",
      "High-Stakes Platforming ('Rage Platformer' Feel): Demanding jump puzzles where composure and calculated patience are essential to beat the game.",
      "Fluid Traversal & Ledge-Grabbing: Custom character movement tuning featuring responsive mantle triggers, wall vaults, and tight mid-air air-control physics.",
      "Collaborative Game Jam Sprint: Team coordination using Git version control to prototype, iterate, and deliver a complete, highly polished build under jam time constraints."
    ],
    technicalDeepDive: {
      heading: "Character Ledge Trace Detection & Traversal Controller",
      explanation: "To provide crisp, responsive climbing over complex maze geometry, a custom dual-sphere trace evaluates forward collision against walls and downward clearance for ledge detection, smoothly transitioning the player into an animated mantle state.",
      codeSnippet: `// Ledge Detection & Mantle State Trigger in C++
bool AHighTideCharacter::EvaluateLedgeMantle(FVector& OutLedgeLocation) {
    FVector Start = GetActorLocation() + FVector(0.f, 0.f, MantleTraceHeightOffset);
    FVector ForwardDir = GetActorForwardVector();
    FVector ForwardEnd = Start + (ForwardDir * ForwardTraceDistance);

    FHitResult WallHit;
    FCollisionQueryParams Params(SCENE_QUERY_STAT(LedgeTrace), false, this);

    // 1. Detect vertical wall surface in front of player
    if (GetWorld()->LineTraceSingleByChannel(WallHit, Start, ForwardEnd, ECC_Visibility, Params)) {
        FVector DownStart = WallHit.ImpactPoint + (ForwardDir * 15.f) + FVector(0.f, 0.f, DownTraceHeight);
        FVector DownEnd = DownStart - FVector(0.f, 0.f, DownTraceDistance);

        FHitResult LedgeHit;
        // 2. Detect walkable horizontal top surface for mantling
        if (GetWorld()->LineTraceSingleByChannel(LedgeHit, DownStart, DownEnd, ECC_Visibility, Params)) {
            if (LedgeHit.Normal.Z >= 0.7f) { // Ensure surface is flat enough
                OutLedgeLocation = LedgeHit.ImpactPoint;
                ExecuteMantleSequence(OutLedgeLocation);
                return true;
            }
        }
    }
    return false;
}`
    }
  },
  {
    id: "street-heist",
    title: "Street Heist: Endless Runner",
    subtitle: "Fast-Paced Urban Runner in Unreal Engine",
    category: "unreal",
    categoryLabel: "Unreal Engine",
    badge: "Featured Unreal Game",
    thumbnail: "assets/street-heist-banner.jpg",
    bannerGradient: "linear-gradient(135deg, #070913 0%, #14172a 50%, #1e1b4b 100%)",
    accentColor: "#00f0ff",
    role: "Lead Gameplay Programmer & Level Designer",
    teamSize: "Solo Project",
    duration: "Featured Project",
    engine: "Unreal Engine (Blueprints & C++)",
    status: "Active Project",
    tags: ["Unreal Engine", "Endless Runner", "Traffic & Cones", "Coin Multiplier", "Niagara VFX"],
    shortDesc: "Dash through the city streets as a daring robber! Dodge oncoming traffic and safety cones, collect shiny coins, and push your limits to set an unbeatable high score in this fast-paced endless runner.",
    links: {
      github: "https://github.com",
      itch: null,
      playUrl: null,
      video: null
    },
    overview: `Dash through the city streets as a daring robber! Dodge oncoming traffic and safety cones, collect shiny coins, and push your limits to set an unbeatable high score in this fast-paced endless runner built in Unreal Engine.`,
    highlights: [
      "Dynamic urban obstacle system: Dodge oncoming traffic, safety cones, roadblocks, and environmental barriers.",
      "Coin collection economy: Gather shiny coins throughout alleyways and streets to boost combo multipliers and high scores.",
      "Responsive runner locomotion: Fluid 3-lane lateral movement, hurdles, sliding, and speed-acceleration physics.",
      "Immersive city atmosphere: Neon signs, rain reflections, flashing police pursuit cruisers, and Niagara particle VFX."
    ],
    technicalDeepDive: {
      heading: "Procedural Track Chunk Pooling & Hazard Spawning",
      explanation: "To guarantee smooth 60+ FPS performance without garbage collection stutter during continuous gameplay, street segments, traffic obstacles, and safety cones are managed via an object pool. Chunks that pass behind the player camera are seamlessly unlinked and repositioned ahead.",
      codeSnippet: `// Road Chunk Recycler & Next Segment Spawner
void AStreetHeistGameMode::SpawnNextRoadChunk(bool bSpawnObstacles) {
    FTransform SpawnTransform = NextSpawnPoint;
    AStreetChunk* NewChunk = WorldPool->GetAvailableChunk(SpawnTransform);
    
    if (NewChunk) {
        NextSpawnPoint = NewChunk->GetAttachTransform();
        if (bSpawnObstacles) {
            // Spawn oncoming traffic, safety cones, and coin lanes
            NewChunk->PopulateLaneHazards(CurrentDifficultyMultiplier);
        }
        ActiveChunks.Add(NewChunk);
    }
}`
    }
  },
  {
    id: "block-stacking",
    title: "Block Stacking",
    subtitle: "Split-Screen Precision Stacking in Unity",
    category: "unity",
    categoryLabel: "Unity / C#",
    badge: "College Team Project",
    thumbnail: "assets/project-block-stack.svg",
    bannerGradient: "linear-gradient(135deg, #05141f 0%, #0a2a3f 50%, #031826 100%)",
    accentColor: "#38bdf8",
    role: "Gameplay & Physics Programmer",
    teamSize: "College Project Team",
    duration: "Academic Project",
    engine: "Unity 2022 LTS (C#)",
    status: "Completed Project",
    tags: ["Unity", "C#", "Split-Screen Multiplayer", "Mesh Slicing", "Physics Simulation"],
    shortDesc: "Place a Block perfectly on top of another block without breaking any parts of the block by misplacing it. Challenge your friends with a split screen to check who has the best accuracy and focus!",
    links: {
      github: "https://github.com",
      itch: null,
      playUrl: null,
      video: null
    },
    overview: `Place a Block perfectly on top of another block without breaking any parts of the block by misplacing it! Challenge your friends with a split screen to check who has the best accuracy and focus. Developed in Unity with C# as a college project with team mates.`,
    highlights: [
      "Competitive Split-Screen Mode: Challenge friends head-to-head on the same screen to test precision, timing, and composure under pressure.",
      "Real-time Mesh Slicing: Misplaced overhangs instantly break away, penalizing inaccurate placements by shrinking subsequent platform dimensions.",
      "Physics-driven Debris: Sliced fragments tumble realistically with Unity's 3D Rigidbody physics.",
      "Perfect placement snapping bonus: Aligning blocks with precision triggers combo streaks and pitch-escalating audio chimes."
    ],
    technicalDeepDive: {
      heading: "Split-Screen Camera Setup & Dynamic Mesh Slicing",
      explanation: "Features dual split-screen viewports for 2-player local competition. The mesh cutter determines the overlapping intersection between moving and target blocks, snapping exact matches and slicing overhangs into falling debris.",
      codeSnippet: `// Calculates overlap and slices excess block segment
public void SliceCurrentBlock(Transform currentBlock, Transform previousBlock) {
    float hangover = currentBlock.position.x - previousBlock.position.x;
    if (Mathf.Abs(hangover) >= previousBlock.localScale.x) {
        TriggerGameOver();
        return;
    }
    
    float newSizeX = previousBlock.localScale.x - Mathf.Abs(hangover);
    float newPosX = previousBlock.position.x + (hangover / 2f);
    
    // Resize primary block to overlap area
    currentBlock.localScale = new Vector3(newSizeX, currentBlock.localScale.y, currentBlock.localScale.z);
    currentBlock.position = new Vector3(newPosX, currentBlock.position.y, currentBlock.position.z);
    
    // Spawn falling slice debris with physics
    SpawnFallingDebris(hangover, newSizeX, currentBlock);
}`
    }
  },
  {
    id: "clashborn",
    title: "CLASHBORN",
    subtitle: "Tactical 3-Life Arena Fighter",
    category: "browser",
    categoryLabel: "UseCrayon.ai Web Game",
    badge: "Playable Web Game",
    thumbnail: "https://gamebuilderapi-thumbnailbucket3bc05c46-njaxbgcn5duh.s3.ap-south-1.amazonaws.com/a9cde97a-3a87-443a-99e4-0095755eccba/1789045042070-hero.jpg",
    bannerGradient: "linear-gradient(135deg, #130026 0%, #30005c 50%, #004d40 100%)",
    accentColor: "#a855f7",
    role: "Game Creator & Designer",
    teamSize: "Solo (UseCrayon.ai)",
    duration: "Playable Release",
    engine: "UseCrayon.ai Game Engine",
    status: "Live & Playable Online",
    tags: ["Web Game", "Arena Fighter", "Combat AI", "Playable in Browser"],
    shortDesc: "Enter the arena. Choose your fighter. Outfight two rivals. Survive three lives. Be the last combatant standing in CLASHBORN!",
    links: {
      github: null,
      itch: null,
      playUrl: "https://app.usecrayon.ai/play/a9cde97a-3a87-443a-99e4-0095755eccba?utm_source=share&utm_surface=gallery_card",
      video: null
    },
    overview: `CLASHBORN is a fast-paced arena battle game where players select their champion and enter an intense triangular survival match against two determined rivals. With a strict 3-life limit, players must master strike timing, dodge recovery windows, and let rivals wear each other down before landing decisive blows.`,
    highlights: [
      "Playable online in browser without downloads or setup.",
      "Triangular arena dynamics: Three combatants simultaneously competing for survival.",
      "3-life round economy that rewards calculated aggression and positioning over button-mashing.",
      "Distinct character options with varying strike arcs, speeds, and tactical playstyles."
    ],
    technicalDeepDive: {
      heading: "Triangular Arena Dynamics & AI Behavior",
      explanation: "Having three simultaneous fighters in the arena introduces organic combat alliances and backstabs, where intelligent spacing and timing determine who emerges as the final victor.",
      codeSnippet: `// Arena Survival Rules:
// 3 Fighters in Arena • 3 Lives Each • Last Champion Standing Wins
PLAYABLE_ONLINE: https://app.usecrayon.ai/play/a9cde97a-3a87-443a-99e4-0095755eccba`
    }
  },
  {
    id: "zombie-last-stand",
    title: "Zombie Last Stand",
    subtitle: "Single-Life City Block Horde Survival",
    category: "browser",
    categoryLabel: "UseCrayon.ai Web Game",
    badge: "Playable Web Game",
    thumbnail: "https://gamebuilderapi-thumbnailbucket3bc05c46-njaxbgcn5duh.s3.ap-south-1.amazonaws.com/83f11fce-3cbf-437e-8259-09e40f3f6cd3/1788980520262-hero.jpg",
    bannerGradient: "linear-gradient(135deg, #180509 0%, #3b0716 50%, #0f0207 100%)",
    accentColor: "#f43f5e",
    role: "Game Creator & Designer",
    teamSize: "Solo (UseCrayon.ai)",
    duration: "Playable Release",
    engine: "UseCrayon.ai Game Engine",
    status: "Live & Playable Online",
    tags: ["Web Game", "Horde Survival", "Top-Down Action", "Playable in Browser"],
    shortDesc: "One survivor, one life, endless zombie hordes in a looping ruined city block. Test your reflexes and survive the relentless swarm.",
    links: {
      github: null,
      itch: null,
      playUrl: "https://app.usecrayon.ai/play/83f11fce-3cbf-437e-8259-09e40f3f6cd3?utm_source=share&utm_surface=gallery_card",
      video: null
    },
    overview: `Created on UseCrayon.ai, Zombie Last Stand places players in the boots of an isolated survivor holding down a ruined city intersection. With only a single life, players must kite the relentless undead, utilize tight cornering around barricades, and maximize weapon firing arcs to survive climbing horde waves.`,
    highlights: [
      "Playable directly in any web browser on desktop or mobile with zero installation.",
      "High-tension single-life survival loop emphasizing positioning, situational awareness, and target priority.",
      "Dynamic zombie swarm navigation adapting to player retreat paths through urban wreckage.",
      "Instant restart loop designed for high-score replayability and rapid gameplay sessions."
    ],
    technicalDeepDive: {
      heading: "Survival Gameplay Loop & Spawning Pressure",
      explanation: "The game design focuses on spatial tension: as the player's survival timer increases, horde spawn rates scale non-linearly, forcing players into tactical risk/reward maneuvers through tight city corridors.",
      codeSnippet: `// Core Survival Loop Rule:
// 1. One Life / High Stakes
// 2. Continuous Urban Looping Track
// 3. Escalating Spawn Pressure based on Survivor Kills
PLAYABLE_ONLINE: https://app.usecrayon.ai/play/83f11fce-3cbf-437e-8259-09e40f3f6cd3`
    }
  },
  {
    id: "foxtrot-heist",
    title: "Foxtrot Heist",
    subtitle: "High-Speed Fox-Masked Getaway & Shootout",
    category: "browser",
    categoryLabel: "UseCrayon.ai Web Game",
    badge: "Playable Web Game",
    thumbnail: "https://gamebuilderapi-thumbnailbucket3bc05c46-njaxbgcn5duh.s3.ap-south-1.amazonaws.com/e303b48b-4b6d-4a5b-bb6c-ecf8af7c703a/1788341136116-hero.jpg",
    bannerGradient: "linear-gradient(135deg, #180902 0%, #431407 50%, #1f0802 100%)",
    accentColor: "#f97316",
    role: "Game Creator & Designer",
    teamSize: "Solo (UseCrayon.ai)",
    duration: "Playable Release",
    engine: "UseCrayon.ai Game Engine",
    status: "Live & Playable Online",
    tags: ["Web Game", "Action Runner", "Combat Mechanics", "Playable in Browser"],
    shortDesc: "A fox-masked bank robber sprints and dodges oncoming traffic while trading fire with pursuing law enforcement between getaway sprints.",
    links: {
      github: null,
      itch: null,
      playUrl: "https://app.usecrayon.ai/play/e303b48b-4b6d-4a5b-bb6c-ecf8af7c703a?utm_source=share&utm_surface=gallery_card",
      video: null
    },
    overview: `Foxtrot Heist blends intense runner locomotion with high-stakes combat shootouts. Stepping into the shoes of a stylized fox-masked operative escaping a vault heist, players weave through high-speed vehicular traffic while actively returning fire at intercepting squads.`,
    highlights: [
      "Playable instantly in browser with intuitive controls and immediate action.",
      "Dual mechanics: High-speed obstacle avoidance combined with real-time combat shooting.",
      "Urban chase aesthetic featuring dynamic vehicle hazards, flashing police cruisers, and gritty getaway routes.",
      "Pacing curves that alternate between precision road weaving and intense combat choke points."
    ],
    technicalDeepDive: {
      heading: "Heist Locomotion & Combat Mechanics",
      explanation: "Balancing vehicle evasion with target engagement creates a compelling cognitive load for players, requiring split-second decisions on whether to duck behind traffic or return suppressive fire.",
      codeSnippet: `// Heist Pursuit Logic:
// Dodge incoming traffic lanes -> Fire back at pursuit vehicles -> Reach extraction
PLAYABLE_ONLINE: https://app.usecrayon.ai/play/e303b48b-4b6d-4a5b-bb6c-ecf8af7c703a`
    }
  }
];

// Technical Skills Categories for Mohamed Aman
const technicalSkills = {
  languages: [
    { name: "C++ (17 / 20)", level: "Core Specialization", desc: "Unreal Engine gameplay architecture, memory management, pointers, RAII, custom actor components" },
    { name: "Blueprints (UE5)", level: "Advanced", desc: "Player controllers, gameplay frameworks, AI logic, event dispatchers, animation blueprints" },
    { name: "C#", level: "Proficient", desc: "Unity scripting, game mechanics, physics interactions, UI integration, editor extensions" },
    { name: "Python", level: "Intermediate", desc: "Tooling scripts, algorithmic logic, build pipeline automation" },
    { name: "JavaScript / HTML5", level: "Intermediate", desc: "Interactive web graphics, Canvas API, Web Audio API, responsive UI" }
  ],
  engines: [
    { name: "Unreal Engine 5", level: "Primary Focus", desc: "Enhanced Input, Character Movement Component, Niagara VFX, EQS AI, Blueprints & C++" },
    { name: "EXR School of Game Dev", level: "Advanced Course", desc: "Professional studio curriculum, game architecture, asset workflows, industry standards" },
    { name: "Unity 2022 LTS", level: "Proficient", desc: "Physics simulation, Mesh slicing, Rigidbody dynamics, split-screen multi-camera setups" },
    { name: "UseCrayon.ai", level: "Experienced", desc: "Rapid game prototyping, arena combat systems, web-first interactive deployment" }
  ],
  gameplayAndCS: [
    { name: "Gameplay Systems & Mechanics", desc: "Third-person combat, endless runner locomotion, dynamic water levels, 3-lane controllers" },
    { name: "Game Jam Collaboration", desc: "Rapid ideation, Git version control, cross-functional teamwork under tight deadlines" },
    { name: "AI & Navigation Systems", desc: "Environment Query System (EQS), NavMesh pathfinding, state machines, sound aggro triggers" },
    { name: "Physics & Dynamic Mesh Slicing", desc: "Intersection planes, dynamic debris generation, Rigidbody collisions, buoyant volumes" },
    { name: "Computer Science Foundations", desc: "Data structures, algorithms, spatial indexing, 3D vector math, memory alignment, profiling" }
  ]
};

// Coursework & CS Foundation for Mohamed Aman
const academicDetails = {
  degree: "Bachelor of Technology (B.Tech) in Computer Science & Engineering",
  specialization: "Focus: Game Development & Real-Time Interactive Systems",
  currentTraining: "Currently on course in EXR School of Game Dev",
  relevantCoursework: [
    "Unreal Engine 5 Architecture & Blueprints",
    "Data Structures & Algorithm Design",
    "Gameplay Systems & Character Locomotion",
    "Operating Systems & Multithreading",
    "Linear Algebra & 3D Vector Mathematics",
    "Physics Simulation & Collision Systems",
    "Object-Oriented Software Design (OOP)",
    "Game Jam Production & Team Collaboration"
  ]
};
