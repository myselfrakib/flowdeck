import { 
  User, 
  Business, 
  Project, 
  Task, 
  Room, 
  Message, 
  ShootEvent, 
  EditVersion, 
  ProjectAsset, 
  ActivityLog, 
  NotificationItem, 
  ClientProfile,
  LeaveRecord
} from '../types';

export const mockBusinesses: Business[] = [
  {
    id: 'biz_apex',
    name: 'Apex Media Studios',
    tagline: 'High-Performance Video & Creative Operations',
    logo: '🎬',
    category: 'Commercial Video & Creative Agency',
    ownerId: 'u_marcus',
    timezone: 'America/New_York (EST)',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    storageProvider: 'google_drive',
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'biz_neon',
    name: 'Neon Peak Creative',
    tagline: 'Boutique Social & Fashion Visuals',
    logo: '⚡',
    category: 'Social First & Fashion Production',
    ownerId: 'u_marcus',
    timezone: 'America/Los_Angeles (PST)',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    storageProvider: 'dropbox',
    createdAt: '2025-06-15T09:00:00Z',
  }
];

export const mockUsers: User[] = [
  {
    id: 'u_marcus',
    name: 'Marcus Vance',
    email: 'marcus@apexmedia.io',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Founder & Executive Producer. 12+ years in commercial production & agency ops.',
    role: 'owner',
    accountType: 'business_owner',
    designation: 'Agency Founder & Director',
    department: 'Executive',
    availability: 'available',
  },
  {
    id: 'u_elena',
    name: 'Elena Rostova',
    email: 'elena@apexmedia.io',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Head of Production & Operations. Keeps all deliverables locked and on schedule.',
    role: 'head_manager',
    accountType: 'employee',
    designation: 'Head of Production',
    department: 'Management',
    availability: 'available',
  },
  {
    id: 'u_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.hr@apexmedia.io',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'People operations, talent contracts, and crew scheduling coordination.',
    role: 'hr_manager',
    accountType: 'employee',
    designation: 'HR & Talent Director',
    department: 'Operations',
    availability: 'available',
  },
  {
    id: 'u_maya',
    name: 'Maya Lin',
    email: 'maya@apexmedia.io',
    phone: '+1 (555) 567-8901',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead Social Strategist and Client Communications Manager.',
    role: 'social_media_manager',
    accountType: 'employee',
    designation: 'Social Media & Client Lead',
    department: 'Social / Strategy',
    availability: 'available',
  },
  {
    id: 'u_liam',
    name: "Liam O'Connor",
    email: 'liam.camera@apexmedia.io',
    phone: '+1 (555) 678-9012',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Director of Photography / Lead Videographer. RED V-Raptor & Sony FX6 owner.',
    role: 'videographer',
    accountType: 'employee',
    designation: 'Senior Cinematographer',
    department: 'Production',
    availability: 'on_shoot',
  },
  {
    id: 'u_david',
    name: 'David Park',
    email: 'david.photo@apexmedia.io',
    phone: '+1 (555) 789-0123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Key Stills & Commercial Photographer. Lighting enthusiast.',
    role: 'photographer',
    accountType: 'freelancer',
    designation: 'Lead Stills Photographer',
    department: 'Production',
    availability: 'available',
  },
  {
    id: 'u_zoe',
    name: 'Zoe Chen',
    email: 'zoe.edit@apexmedia.io',
    phone: '+1 (555) 890-1234',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Senior Video Editor & Colorist. DaVinci Resolve Studio & Premiere Pro specialist.',
    role: 'video_editor',
    accountType: 'employee',
    designation: 'Lead Video Editor & Colorist',
    department: 'Post-Production',
    availability: 'busy',
  },
  {
    id: 'u_alex',
    name: 'Alex Rivera',
    email: 'alex.design@apexmedia.io',
    phone: '+1 (555) 901-2345',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Graphic Designer & Motion Graphics Artist. 2D/3D kinetic typography.',
    role: 'graphic_designer',
    accountType: 'freelancer',
    designation: 'Motion & Graphic Designer',
    department: 'Creative',
    availability: 'available',
  },
  {
    id: 'u_chloe',
    name: 'Chloe Bennett',
    email: 'chloe.model@gmail.com',
    phone: '+1 (555) 012-3456',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    bio: 'Commercial Talent & Brand Ambassador. Represented in NYC / Miami.',
    role: 'model',
    accountType: 'freelancer',
    designation: 'Featured Talent / Model',
    department: 'Talent',
    availability: 'available',
  },
  {
    id: 'u_client_claire',
    name: 'Claire Dupont',
    email: 'claire@auraskincare.com',
    phone: '+1 (555) 123-9876',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Global Brand VP at Aura Skincare London & New York.',
    role: 'client',
    accountType: 'client',
    designation: 'VP Brand Marketing (Client)',
    department: 'Aura Skincare',
    availability: 'available',
    isExternalClient: true,
  }
];

export const mockClients: ClientProfile[] = [];

export const mockProjects: Project[] = [
  {
    id: 'proj_aura_radiance',
    businessId: 'biz_apex',
    code: 'AURA-2601',
    title: 'Aura Skincare — Radiance Reel Launch 2026',
    clientName: 'Aura Botanicals',
    clientId: 'client_aura',
    leadId: 'u_elena',
    type: 'brand_video',
    status: 'in_review',
    priority: 'urgent',
    deadline: '2026-11-28T18:00:00Z',
    aspectRatio: '9:16 & 16:9',
    duration: '60s Hero + 3x 15s Cuts',
    targetPlatforms: ['Instagram Reels', 'TikTok', 'YouTube Ads'],
    briefSummary: 'High-end beauty commercial showcasing the morning glow routine with natural daylight aesthetic, micro-droplets, and clean kinetic typography.',
    objectives: [
      'Elevate Aura brand perception with cinematic macro product shots',
      'Generate 2M+ views across IG Reels & TikTok with hook-first editing',
      'Secure client sign-off on Version 2 before Friday ad spend launch'
    ],
    referenceLinks: [
      'https://vimeo.com/channels/cinematicbeauty/ref-aura-glow',
      'https://drive.google.com/drive/folders/aura-moodboard-2026'
    ],
    teamIds: ['u_elena', 'u_maya', 'u_liam', 'u_zoe', 'u_chloe', 'u_client_claire'],
    progressPercent: 78,
    createdAt: '2026-11-10T10:00:00Z',
  },
  {
    id: 'proj_zenith_sprint',
    businessId: 'biz_apex',
    code: 'ZNTH-2602',
    title: 'Zenith Activewear — Urban Sprint SS26',
    clientName: 'Zenith Urban Active',
    clientId: 'client_zenith',
    leadId: 'u_maya',
    type: 'photoshoot',
    status: 'in_production',
    priority: 'high',
    deadline: '2026-12-05T18:00:00Z',
    aspectRatio: '4:5 & 1:1',
    duration: '45 Select Stills + 20 Looping B-Roll clips',
    targetPlatforms: ['E-Commerce Lookbook', 'Instagram Feed', 'Retail Billboards'],
    briefSummary: 'Editorial athletic photoshoot set across downtown concrete architecture at golden hour, capturing moisture-wicking techwear in active motion.',
    objectives: [
      'Deliver 45 retouched e-commerce stills and high-speed motion loops',
      'Coordinate 3 athletes on Manhattan rooftop location'
    ],
    referenceLinks: [
      'https://drive.google.com/drive/folders/zenith-ss26-styleguide'
    ],
    teamIds: ['u_maya', 'u_david', 'u_elena', 'u_chloe'],
    progressPercent: 45,
    createdAt: '2026-11-15T11:00:00Z',
  },
  {
    id: 'proj_hyperion_drive',
    businessId: 'biz_apex',
    code: 'HYP-2603',
    title: 'Hyperion EV Motors — Future Drive Commercial',
    clientName: 'Hyperion EV',
    clientId: 'client_hyperion',
    leadId: 'u_marcus',
    type: 'commercial',
    status: 'planning',
    priority: 'medium',
    deadline: '2026-12-20T18:00:00Z',
    aspectRatio: '16:9 & 2.39:1 Anamorphic',
    duration: '90s Brand Anthem',
    targetPlatforms: ['Connected TV', 'YouTube Masthead', 'Auto Show Keynote'],
    briefSummary: 'Futuristic electric vehicle brand film featuring drone chase footage in the desert and high-end CGI dashboard UI overlays.',
    objectives: [
      'Highlight 0-60mph instant acceleration and autonomous cockpit UI',
      'Deliver cinema 4K ProRes master'
    ],
    referenceLinks: [
      'https://drive.google.com/drive/folders/hyperion-ev-assets'
    ],
    teamIds: ['u_marcus', 'u_elena', 'u_liam', 'u_zoe', 'u_alex'],
    progressPercent: 20,
    blockerReason: 'Awaiting client confirmation on desert permit location before finalizing production dates.',
    blockerOwnerId: 'u_elena',
    createdAt: '2026-11-18T14:00:00Z',
  }
];

export const mockTasks: Task[] = [];

export const mockRooms: Room[] = [
  {
    id: 'room_aura_client',
    businessId: 'biz_apex',
    projectId: 'proj_aura_radiance',
    name: 'Client Discussion — Aura Skincare',
    description: 'External-facing channel with Claire Dupont (Client). High-level briefs, milestone confirmations, and formal approvals.',
    roomType: 'client_discussion',
    visibility: 'client_visible',
    memberIds: ['u_client_claire', 'u_maya', 'u_elena', 'u_marcus'],
    unreadCount: 1,
    lastMessageText: 'Elena, Version 2 looks significantly closer! Left 2 minor timestamp notes in the player.',
    lastMessageTime: '10 mins ago',
  },
  {
    id: 'room_aura_internal',
    businessId: 'biz_apex',
    projectId: 'proj_aura_radiance',
    name: 'Internal Planning & Creative Strategy',
    description: 'Private agency room for budget, team scheduling, raw feedback, and margin notes. Client cannot see this.',
    roomType: 'internal_planning',
    visibility: 'internal',
    memberIds: ['u_marcus', 'u_elena', 'u_maya', 'u_zoe', 'u_liam'],
    unreadCount: 0,
    lastMessageText: 'Client is happy with the pace, lets make sure the end-card typography does not clip on mobile.',
    lastMessageTime: '1 hour ago',
  },
  {
    id: 'room_aura_production',
    businessId: 'biz_apex',
    projectId: 'proj_aura_radiance',
    name: 'Production & Shoot Logistics',
    description: 'Crew communication on shoot day: call times, studio parking, equipment pack, lighting cues.',
    roomType: 'production_shoot',
    visibility: 'internal',
    memberIds: ['u_liam', 'u_david', 'u_chloe', 'u_elena'],
    unreadCount: 0,
    lastMessageText: 'All 6K B-Roll rushes uploaded to the Drive folder 04_Raw_Footage.',
    lastMessageTime: 'Yesterday',
  },
  {
    id: 'room_aura_edit',
    businessId: 'biz_apex',
    projectId: 'proj_aura_radiance',
    name: 'Editing Room & Revision Queue',
    description: 'Direct collaboration with Zoe on timeline cuts, LUT adjustments, audio stems, and render exports.',
    roomType: 'editing_room',
    visibility: 'internal',
    memberIds: ['u_zoe', 'u_elena', 'u_maya'],
    unreadCount: 2,
    lastMessageText: 'Rendered v2.1 with the warm grade at 00:14. Sending to review player now.',
    lastMessageTime: '25 mins ago',
  }
];

export const mockMessages: Record<string, Message[]> = {
  room_aura_client: [
    {
      id: 'msg_c1',
      roomId: 'room_aura_client',
      senderId: 'u_maya',
      text: 'Good morning @Claire! We have uploaded Version 2.0 to the review portal with the new music track and updated brand intro.',
      createdAt: 'Today, 09:15 AM',
      reactions: [
        { emoji: '✨', count: 2, users: ['u_client_claire', 'u_elena'] }
      ]
    },
    {
      id: 'msg_c2',
      roomId: 'room_aura_client',
      senderId: 'u_client_claire',
      text: 'Thank you Maya! The energy of this cut is fantastic. I watched it twice on my phone. Just left 2 small notes on the serum texture shot at 00:14.',
      createdAt: 'Today, 10:45 AM',
      reactions: [
        { emoji: '🙌', count: 3, users: ['u_maya', 'u_elena', 'u_zoe'] }
      ]
    },
    {
      id: 'msg_c3',
      roomId: 'room_aura_client',
      senderId: 'u_elena',
      text: 'Understood Claire! Zoe is already tuning that specific shot to bring out the botanical micro-droplet texture. We will have the updated v2.1 ready for your final sign-off by 2 PM.',
      createdAt: 'Today, 11:02 AM',
      isPinned: true
    }
  ],
  room_aura_internal: [
    {
      id: 'msg_i1',
      roomId: 'room_aura_internal',
      senderId: 'u_elena',
      text: 'Team, Claire loved the overall vibe of v2.0. Margin is healthy on this project and client is on track for Q1 renewal.',
      createdAt: 'Today, 09:30 AM'
    },
    {
      id: 'msg_i2',
      roomId: 'room_aura_internal',
      senderId: 'u_zoe',
      text: 'Great news. The grade at 00:14 took 15 mins to fix. Re-exporting in 4K ProRes 422 HQ now.',
      createdAt: 'Today, 10:50 AM',
      reactions: [
        { emoji: '🚀', count: 2, users: ['u_elena', 'u_maya'] }
      ]
    }
  ],
  room_aura_edit: [
    {
      id: 'msg_e1',
      roomId: 'room_aura_edit',
      senderId: 'u_elena',
      text: '@Zoe here is Claire’s timestamp feedback: at 00:14 make sure the serum drop has maximum clarity before the product cuts to Chloe smiling.',
      createdAt: 'Today, 10:47 AM'
    },
    {
      id: 'msg_e2',
      roomId: 'room_aura_edit',
      senderId: 'u_zoe',
      text: 'On it right now! Will upload v2.1 directly into the review module so you can test playback on iOS Safari.',
      createdAt: 'Today, 10:55 AM'
    }
  ]
};

export const mockShootEvents: ShootEvent[] = [
  {
    id: 'shoot_aura_studio',
    projectId: 'proj_aura_radiance',
    title: 'Aura Radiance — Main Studio Production Day',
    location: 'Pier 59 Studios, Stage C, Chelsea Piers, NY',
    locationAddress: '59 Chelsea Piers, New York, NY 10011',
    mapUrl: 'https://maps.google.com/?q=Pier+59+Studios+NYC',
    startAt: '2026-11-25T08:00:00Z',
    endAt: '2026-11-25T17:00:00Z',
    status: 'confirmed',
    participants: [
      { userId: 'u_liam', role: 'Director of Photography', status: 'accepted', callTime: '07:30 AM' },
      { userId: 'u_david', role: 'Key Stills Photographer', status: 'accepted', callTime: '08:00 AM' },
      { userId: 'u_chloe', role: 'Lead Talent (Model)', status: 'accepted', callTime: '08:30 AM' },
      { userId: 'u_elena', role: 'Line Producer', status: 'accepted', callTime: '07:00 AM' }
    ],
    wardrobeNotes: 'Clean organic minimalism: ivory silk robe, neutral linen shirt, bare dewy shoulder look. No busy logos or high-contrast patterns.',
    propsEquipment: [
      'Sony FX6 + G-Master 24-70mm f/2.8 II & 90mm Macro f/2.8',
      'Aputure 600d Pro with Light Dome 150cm (Soft daylight key)',
      'Acrylic light diffusion water tank for botanical dropper shots',
      '12 bottles of Aura Radiance Dew Drops with unbroken tamper seals'
    ],
    directorNotes: 'Capture high frame rate (120fps) when the droplet impacts the model skin. Emphasize natural morning glow without artificial glitter.',
    weatherNotes: 'Indoor Stage C (Climate controlled 72°F). High humidity setting for dewy skin.',
    createdAt: '2026-11-12T10:00:00Z'
  },
  {
    id: 'shoot_zenith_rooftop',
    projectId: 'proj_zenith_sprint',
    title: 'Zenith SS26 — Golden Hour Rooftop Shoot',
    location: '45 Wall St Skyline Rooftop, Financial District, NY',
    locationAddress: '45 Wall Street, New York, NY 10005',
    mapUrl: 'https://maps.google.com/?q=45+Wall+St+New+York',
    startAt: '2026-11-26T15:00:00Z',
    endAt: '2026-11-26T19:00:00Z',
    status: 'proposed',
    participants: [
      { userId: 'u_david', role: 'Principal Photographer', status: 'accepted', callTime: '14:30 PM' },
      { userId: 'u_chloe', role: 'Athlete Model', status: 'accepted', callTime: '14:45 PM' },
      { userId: 'u_maya', role: 'On-Site Art Director', status: 'accepted', callTime: '14:15 PM' },
      { userId: 'u_liam', role: 'B-Roll Videographer', status: 'suggested_alternative', callTime: '15:00 PM', suggestedAlternativeTime: '2026-11-27T15:00:00Z' }
    ],
    wardrobeNotes: 'Zenith Storm-Grey compression tights, neon reflective windbreaker, black stealth running shoes.',
    propsEquipment: [
      'Hasselblad X2D 100C + 55mm f/2.5',
      'Profoto B10X Plus High-Speed Sync strobe with Magnum reflector',
      'Portable haze generator for skyline light rays'
    ],
    directorNotes: 'Focus on high-speed dynamic running strides against Manhattan skyscrapers at 1/2000s shutter speed.',
    conflictWarning: 'Liam has another shoot wrapping at 14:00 in Brooklyn. Suggested shifting to Friday Nov 27 or assigning secondary camera operator.',
    createdAt: '2026-11-16T12:00:00Z'
  }
];

export const mockEditVersions: EditVersion[] = [
  {
    id: 'ver_aura_v1',
    projectId: 'proj_aura_radiance',
    versionNumber: 1,
    versionTag: 'v1.0 — Initial Assembly Cut',
    submittedBy: 'u_zoe',
    submittedAt: '2026-11-19T16:00:00Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 60,
    status: 'revision_requested',
    reviewUrl: 'https://studioflow.io/review/aura-v1-preview',
    driveLink: 'https://drive.google.com/drive/folders/aura-v1-renders',
    changeNotes: 'First rough assembly based on initial storyboard. Temporary audio track.',
    comments: [
      {
        id: 'comm_1',
        userId: 'u_elena',
        timestampSeconds: 5,
        timestampFormatted: '00:05',
        text: 'Hook needs to be punchier. Cut Chloe opening the product 1 second earlier.',
        createdAt: '2026-11-19T18:20:00Z',
        resolved: true
      },
      {
        id: 'comm_2',
        userId: 'u_client_claire',
        timestampSeconds: 14,
        timestampFormatted: '00:14',
        text: 'Love the daylight lighting here, but can we enhance the dropper droplet so the golden sheen pops more?',
        createdAt: '2026-11-20T10:15:00Z',
        resolved: true
      }
    ]
  },
  {
    id: 'ver_aura_v2',
    projectId: 'proj_aura_radiance',
    versionNumber: 2,
    versionTag: 'v2.0 — Color Graded & Sound Mastered',
    submittedBy: 'u_zoe',
    submittedAt: '2026-11-22T08:30:00Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512290900672-1f5be5ef861c?w=600&auto=format&fit=crop&q=80',
    durationSeconds: 60,
    status: 'client_review',
    reviewUrl: 'https://studioflow.io/review/aura-v2-client',
    driveLink: 'https://drive.google.com/drive/folders/aura-v2-master-prores',
    changeNotes: 'Addressed all v1 notes: tightened opening hook, applied cinematic warm beauty LUT, mastered audio with soothing ambient mix.',
    internalApprovedBy: 'u_elena',
    internalApprovedAt: '2026-11-22T09:45:00Z',
    comments: [
      {
        id: 'comm_3',
        userId: 'u_client_claire',
        timestampSeconds: 14,
        timestampFormatted: '00:14',
        text: 'The color grading looks breathtaking! Just ensure the white text overlay remains legible over the cream background.',
        createdAt: '2026-11-23T10:30:00Z',
        resolved: false
      },
      {
        id: 'comm_4',
        userId: 'u_client_claire',
        timestampSeconds: 52,
        timestampFormatted: '00:52',
        text: 'Check that our updated brand slogan "Radiance Awakens Within" matches the UK packaging typography.',
        createdAt: '2026-11-23T10:38:00Z',
        resolved: false
      }
    ]
  }
];

export const mockAssets: ProjectAsset[] = [
  {
    id: 'ast_1',
    projectId: 'proj_aura_radiance',
    name: 'Aura_Brand_Book_Guidelines_2026.pdf',
    category: 'brief',
    folder: '01_Brief',
    storageProvider: 'google_drive',
    sizeFormatted: '14.2 MB',
    url: 'https://drive.google.com/file/d/aura-brandbook-2026/view',
    visibility: 'client_visible',
    uploadedBy: 'u_client_claire',
    createdAt: '2026-11-10T11:00:00Z',
    mimeType: 'application/pdf'
  },
  {
    id: 'ast_2',
    projectId: 'proj_aura_radiance',
    name: 'Aura_Visual_Moodboard_FilmLook.pdf',
    category: 'inspiration',
    folder: '02_Inspiration',
    storageProvider: 'google_drive',
    sizeFormatted: '28.6 MB',
    url: 'https://drive.google.com/file/d/aura-moodboard/view',
    visibility: 'internal',
    uploadedBy: 'u_maya',
    createdAt: '2026-11-11T14:30:00Z',
    mimeType: 'application/pdf'
  },
  {
    id: 'ast_3',
    projectId: 'proj_aura_radiance',
    name: 'Pier59_CallSheet_Official_Signed.pdf',
    category: 'shoot_planning',
    folder: '03_Shoot_Planning',
    storageProvider: 'google_drive',
    sizeFormatted: '1.8 MB',
    url: 'https://drive.google.com/file/d/callsheet-p59/view',
    visibility: 'internal',
    uploadedBy: 'u_elena',
    createdAt: '2026-11-14T09:15:00Z',
    mimeType: 'application/pdf'
  },
  {
    id: 'ast_4',
    projectId: 'proj_aura_radiance',
    name: 'RAW_Camera_Card_A_FX6_Reel01.zip',
    category: 'raw_footage',
    folder: '04_Raw_Footage',
    storageProvider: 'google_drive',
    sizeFormatted: '48.4 GB (External Drive)',
    url: 'https://drive.google.com/drive/folders/raw-fx6-card-a',
    visibility: 'internal',
    uploadedBy: 'u_liam',
    createdAt: '2026-11-17T18:40:00Z',
    mimeType: 'application/zip'
  },
  {
    id: 'ast_5',
    projectId: 'proj_aura_radiance',
    name: 'Aura_Radiance_v2.0_ClientReview_1080p.mp4',
    category: 'review',
    folder: '07_Review',
    storageProvider: 'google_drive',
    sizeFormatted: '142 MB',
    url: 'https://drive.google.com/file/d/aura-v2-review/view',
    visibility: 'client_visible',
    uploadedBy: 'u_zoe',
    createdAt: '2026-11-22T08:35:00Z',
    mimeType: 'video/mp4'
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'act_1',
    projectId: 'proj_aura_radiance',
    actorId: 'u_zoe',
    action: 'submitted new version',
    target: 'Version 2.0 (Color Graded & Sound Mastered)',
    timestamp: 'Today at 08:30 AM',
    category: 'version'
  },
  {
    id: 'act_2',
    projectId: 'proj_aura_radiance',
    actorId: 'u_elena',
    action: 'granted internal approval for',
    target: 'Version 2.0 (Ready for Client Review)',
    timestamp: 'Today at 09:45 AM',
    category: 'approval'
  },
  {
    id: 'act_3',
    projectId: 'proj_aura_radiance',
    actorId: 'u_client_claire',
    action: 'added timestamp comment at 00:14 on',
    target: 'Version 2.0 Review Player',
    timestamp: 'Today at 10:30 AM',
    category: 'version'
  },
  {
    id: 'act_4',
    projectId: 'proj_aura_radiance',
    actorId: 'u_maya',
    action: 'converted chat note into task:',
    target: 'Refine Color Grade on Golden Hour Scene (00:14)',
    timestamp: 'Today at 10:52 AM',
    category: 'task'
  },
  {
    id: 'act_5',
    projectId: 'proj_aura_radiance',
    actorId: 'u_liam',
    action: 'confirmed attendance for',
    target: 'Pier 59 Studios Production Day',
    timestamp: 'Yesterday at 16:20 PM',
    category: 'shoot'
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    recipientId: 'u_zoe',
    title: 'New Client Timestamp Comment',
    message: 'Claire Dupont commented at 00:14: "The color grading looks breathtaking..."',
    type: 'draft_submitted',
    projectId: 'proj_aura_radiance',
    read: false,
    createdAt: '15 mins ago'
  },
  {
    id: 'notif_2',
    recipientId: 'u_marcus',
    title: 'Client Review Pending',
    message: 'Aura Skincare Radiance Reel v2 is awaiting Claire Dupont final sign-off.',
    type: 'draft_submitted',
    projectId: 'proj_aura_radiance',
    read: false,
    createdAt: '1 hour ago'
  },
  {
    id: 'notif_3',
    recipientId: 'u_elena',
    title: 'Shoot Reschedule Request',
    message: 'Liam O\'Connor suggested Friday Nov 27 for Zenith SS26 Rooftop shoot due to schedule conflict.',
    type: 'shoot_proposal',
    projectId: 'proj_zenith_sprint',
    read: true,
    createdAt: '3 hours ago'
  },
  {
    id: 'notif_4',
    recipientId: 'u_elena',
    title: 'Project Blocker Flagged',
    message: 'Hyperion EV Motors flagged blocked: Awaiting BLM drone permit clearance.',
    type: 'blocker',
    projectId: 'proj_hyperion_drive',
    read: true,
    createdAt: 'Yesterday'
  }
];

export const mockLeaveRecords: LeaveRecord[] = [
  {
    id: 'leave_1',
    userId: 'u_david',
    type: 'annual',
    startDate: '2026-12-24',
    endDate: '2026-12-28',
    reason: 'Family Holiday Vacation',
    status: 'approved',
    approvedBy: 'u_sarah'
  },
  {
    id: 'leave_2',
    userId: 'u_chloe',
    type: 'shoot_compensation',
    startDate: '2026-12-02',
    endDate: '2026-12-03',
    reason: 'Rest recovery after 3 consecutive studio shoot days',
    status: 'pending'
  }
];

export const mockRolePermissions = {
  createBusiness: { owner: true, manager: false, editor: false, model: false, client: false },
  inviteMembers: { owner: true, manager: true, editor: false, model: false, client: false },
  createProject: { owner: true, manager: true, editor: true, model: false, client: 'request_only' },
  editAssignedTask: { owner: true, manager: true, editor: 'assigned_only', model: 'shoot_only', client: false },
  viewInternalRoom: { owner: true, manager: 'if_member', editor: 'if_member', model: 'if_member', client: false },
  viewClientRoom: { owner: true, manager: 'if_member', editor: 'if_member', model: 'if_member', client: 'if_member' },
  approveFinal: { owner: true, manager: true, editor: false, model: false, client: 'if_requested' },
  accessHR: { owner: true, manager: false, editor: false, model: false, client: false }
};

