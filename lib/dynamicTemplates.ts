import { DynamicPromptStyle } from '../types';

export const DYNAMIC_STYLES: DynamicPromptStyle[] = [
    {
        "id": 1,
        "styleName": "Cozy_Neat_Aesthetic",
        "styleDescription": "A gentle, inviting, and neatly arranged scene, perfect for gifts or delicate items.",
        "dynamicPrompt": "A [Color_Theme]-colored scene featuring a [Product_Category] with [Number_of_Pieces] pieces, neatly arranged [Placement_Style]. The setup displays [List_of_Core_Items]. The background includes cozy home elements such as [Background_Props_1], [Background_Props_2], wooden blocks spelling '[English_Keyword]', and small decorative [Small_Decorations]. The scene is set on a [Surface_Material] surface, creating a [Atmosphere_Vibe] atmosphere. The image also contains bold, clear Arabic text promoting the product, reading '[Main_Arabic_Headline]', with additional smaller Arabic text reading '[Secondary_Arabic_Text]'.",
        "requiredVariables": ["Color_Theme", "Product_Category", "Number_of_Pieces", "Placement_Style", "List_of_Core_Items", "Background_Props_1", "Background_Props_2", "English_Keyword", "Small_Decorations", "Surface_Material", "Atmosphere_Vibe", "Main_Arabic_Headline", "Secondary_Arabic_Text"]
    },
    {
        "id": 2,
        "styleName": "Educational_Step_by_Step",
        "styleDescription": "A professional layout with a main product and illustrations showing how to use it in steps.",
        "dynamicPrompt": "A professional promotional image for a [Product_Category] with the following details: A [Layout_Style] layout featuring a [Product_Appearance] [Main_Product_Item] labeled '[Brand_Name]' on the [Product_Placement]. To the [Illustration_Placement] of the product, [Number_of_Steps] step-by-step illustrations demonstrating the [Process_Description]: 1. [Step_1_Action_Visual] with the caption '1. [Step_1_Arabic_Caption]'. 2. [Step_2_Action_Visual] with the caption '2. [Step_2_Arabic_Caption]'. 3. [Step_3_Action_Visual] with the caption '3. [Step_3_Arabic_Caption]'. A bold, attention-grabbing headline at the top in Arabic: '[Main_Arabic_Headline]'. Highlighted text at the bottom emphasizing [Highlight_Focus]: '[Bottom_Arabic_Highlights]'. The overall color scheme uses [Color_Palette] for a [Aesthetic_Vibe] aesthetic.",
        "requiredVariables": ["Product_Category", "Layout_Style", "Product_Appearance", "Main_Product_Item", "Brand_Name", "Product_Placement", "Illustration_Placement", "Number_of_Steps", "Process_Description", "Step_1_Action_Visual", "Step_1_Arabic_Caption", "Step_2_Action_Visual", "Step_2_Arabic_Caption", "Step_3_Action_Visual", "Step_3_Arabic_Caption", "Main_Arabic_Headline", "Highlight_Focus", "Bottom_Arabic_Highlights", "Color_Palette", "Aesthetic_Vibe"]
    },
    {
        "id": 3,
        "styleName": "Lifestyle_In_Use",
        "styleDescription": "Shows the product being used by a person in a real-life home environment.",
        "dynamicPrompt": "A lifestyle promotional image featuring [Subject_Description] performing an action like [Main_Action] in a modern kitchen or home setting. The image highlights a [Main_Product_Description] with [Product_Effect] rising from it, positioned on a [Surface_Material] next to [Environment_Feature]. The background features [Background_Details], creating a [Overall_Vibe] atmosphere. Bold text in Arabic at the top reads: '[Main_Arabic_Headline]' and a colored button (e.g., [Button_Color]) at the bottom says: '[CallTo_Action_Text]'.",
        "requiredVariables": ["Subject_Description", "Main_Action", "Main_Product_Description", "Product_Effect", "Surface_Material", "Environment_Feature", "Background_Details", "Overall_Vibe", "Main_Arabic_Headline", "Button_Color", "CallTo_Action_Text"]
    },
    {
        "id": 4,
        "styleName": "Before_After_Comparison",
        "styleDescription": "A comparison advertisement showing the 'Problem' state vs. the 'Solution' state.",
        "dynamicPrompt": "A [Overall_Aesthetic] promotional image for [Product_Category] featuring a 'Before and After' comparison layout. The left side shows a close-up of [Target_Subject] in a state of [Problem_State_Description], marked clearly with a red 'X', against a [Problem_Background_Color] background. The right side shows the same [Target_Subject] in a state of [Solution_State_Description], marked with a green checkmark, against a [Solution_Background_Color] background. Centrally positioned between the two states is a [Product_Appearance] of [Brand_Name] [Product_Category], standing on a [Product_Surface]. At the top, bold Arabic text asks '[Main_Arabic_Question]'. Below the comparison images, several bullet points in Arabic highlight benefits such as: '[Benefit_1_Arabic]', '[Benefit_2_Arabic]', '[Benefit_3_Arabic]', and '[Benefit_4_Arabic]'. At the bottom, a clear call to action in Arabic says '[CTA_Arabic]'.",
        "requiredVariables": ["Overall_Aesthetic", "Product_Category", "Target_Subject", "Problem_State_Description", "Problem_Background_Color", "Solution_State_Description", "Solution_Background_Color", "Product_Appearance", "Brand_Name", "Product_Surface", "Main_Arabic_Question", "Benefit_1_Arabic", "Benefit_2_Arabic", "Benefit_3_Arabic", "Benefit_4_Arabic", "CTA_Arabic"]
    },
    {
        "id": 5,
        "styleName": "Health_and_Safety_Protection",
        "styleDescription": "Focuses on hygiene and safety, featuring protective visual elements like auras/shields.",
        "dynamicPrompt": "A [Setting_Description] scene with a focus on a [Product_Appearance] [Product_Category], placed on a [Surface_Material]. The product emits a [Aura_Color] protective aura with [Aura_Icons] surrounding it, symbolizing [Symbolic_Meaning]. In the background, [Background_Subject], slightly blurred to emphasize the product. [Lighting_Condition] creates a [Atmosphere_Vibe] atmosphere. Arabic text is prominently displayed at the top in [Top_Text_Color], reading '[Main_Arabic_Headline]'. At the bottom, a [Button_Color] button with [Button_Text_Color] Arabic text reads '[CallTo_Action_Text]'. The overall tone is [Overall_Tone].",
        "requiredVariables": ["Setting_Description", "Product_Appearance", "Product_Category", "Surface_Material", "Aura_Color", "Aura_Icons", "Symbolic_Meaning", "Background_Subject", "Lighting_Condition", "Atmosphere_Vibe", "Top_Text_Color", "Main_Arabic_Headline", "Button_Color", "Button_Text_Color", "CallTo_Action_Text", "Overall_Tone"]
    },
    {
        "id": 6,
        "styleName": "Fashion_Apparel_Multi_Angle",
        "styleDescription": "A highly versatile template for clothing and fashion. Designed to be looped with 5 different 'Camera_Shot_Type' values.",
        "dynamicPrompt": "A high-end fashion editorial photo of a [Model_Description] wearing a [Product_Description] made of [Fabric_Details]. The image is a [Camera_Shot_Type] designed to showcase the garment's fit, drape, and styling. The model is positioned in a [Setting_Environment]. The lighting is [Lighting_Vibe] to highlight the texture and premium quality of the apparel. Shot on an 85mm lens, highly detailed, photorealistic, Vogue magazine aesthetic.",
        "requiredVariables": ["Model_Description", "Product_Description", "Fabric_Details", "Camera_Shot_Type", "Setting_Environment", "Lighting_Vibe"]
    },
    {
        "id": 7,
        "styleName": "Advanced_Odor_Elimination",
        "styleDescription": "Focuses specifically on neutralizing and preventing bad odors in the home.",
        "dynamicPrompt": "A modern, sleek [Color_or_Finish] [Product_Category] with [Subject_Details] is placed on a [Floor_Material] [Setting_Environment]. The product emits a [Odor_Aura_Color] protective aura containing specialized [Odor_Filter_Icons]. Positioned next to the product is a prominent [Specific_Protection_Icon] with specialized [Odor_Symbolism] symbolizing [Odor_Focus]. Arabic text is displayed prominently in the upper part of the image, with the words '[Main_Odor_Arabic_Headline]' in large [Headline_Color_1] and [Headline_Color_2] font, followed by smaller [Subtext_Color] text beneath it. A colored [Button_Shape] button in the bottom [Button_Position] corner contains white Arabic text, '[CTA_Odor_Arabic]'. The overall atmosphere is [Overall_Vibe], emphasizing the product's effectiveness.",
        "requiredVariables": ["Color_or_Finish", "Product_Category", "Subject_Details", "Floor_Material", "Setting_Environment", "Odor_Aura_Color", "Odor_Filter_Icons", "Specific_Protection_Icon", "Odor_Symbolism", "Odor_Focus", "Main_Odor_Arabic_Headline", "Headline_Color_1", "Headline_Color_2", "Subtext_Color", "Button_Shape", "Button_Position", "CTA_Odor_Arabic", "Overall_Vibe"]
    },
    {
        "id": 8,
        "styleName": "Luxury_Premium_Quality",
        "styleDescription": "Designed for high-end products like perfumes or luxury goods. Emphasizes elegance and high value.",
        "dynamicPrompt": "Create a high-quality advertisement image for a [Product_Category] named '[Brand_Name]'. The image features a [Product_Details], containing/filled with [Inner_Product_Details]. The product is placed on a [Surface_Material] with a [Background_Description] background, creating a [Atmosphere_Vibe] atmosphere. [Visual_Effects], adding a sense of [Effect_Mood]. At the top of the image, include bold Arabic text in a [Headline_Font_Style] font that reads: '[Main_Headline_Arabic]'. To the right of the product, depict [Icons_Description], with accompanying Arabic text that says: '[Icons_Text_Arabic]'. Below the product, include additional Arabic text in [Bottom_Text_Color] fonts: '[Bottom_Text_1_Arabic]' and '[Bottom_Text_2_Arabic]'. The overall color scheme should be [Color_Scheme], emphasizing [Emphasized_Qualities]. The composition should be clean and balanced, highlighting the product and its key selling points clearly and elegantly.",
        "requiredVariables": ["Product_Category", "Brand_Name", "Product_Details", "Inner_Product_Details", "Surface_Material", "Background_Description", "Atmosphere_Vibe", "Visual_Effects", "Effect_Mood", "Headline_Font_Style", "Main_Headline_Arabic", "Icons_Description", "Icons_Text_Arabic", "Bottom_Text_Color", "Bottom_Text_1_Arabic", "Bottom_Text_2_Arabic", "Color_Scheme", "Emphasized_Qualities"]
    },
    {
        "id": 9,
        "styleName": "Superior_Solution_Comparison",
        "styleDescription": "Shows the superiority of a single multi-functional product over multiple individual items (One vs. Many).",
        "dynamicPrompt": "A [Layout_Style] scene featuring a collection of [Product_Category] tools arranged [Placement_Style]. In the center, a [Approved_Count] [Main_Product_Items], highlighted with a large [Approved_Highlight_Color] [Approval_Symbol_Description]. Surrounding this central item are [Number_of_Rejected_Tools] individual tools, listed as: [Rejected_Tool_List], each marked with a bold [Rejected_Highlight_Color] [Rejection_Symbol_Description]. The background shows a [Background_Details] setting. At the top of the image, bold Arabic text reads '[Main_Arabic_Headline_dynamic]', with a smaller tagline below stating '[Tagline_Arabic_Text_dynamic]'. At the bottom, a colored [CTA_Button_Shape] contains the Arabic text '[CTA_Arabic_Text_dynamic]'. The overall style is [Aesthetic_Vibe], designed to emphasize [Key_Benefit_Emphasis] solutions.",
        "requiredVariables": ["Layout_Style", "Placement_Style", "Product_Category", "Approved_Count", "Main_Product_Items", "Approved_Highlight_Color", "Approval_Symbol_Description", "Number_of_Rejected_Tools", "Rejected_Tool_List", "Rejected_Highlight_Color", "Rejection_Symbol_Description", "Background_Details", "Main_Arabic_Headline_dynamic", "Tagline_Arabic_Text_dynamic", "CTA_Button_Shape", "CTA_Arabic_Text_dynamic", "Aesthetic_Vibe", "Key_Benefit_Emphasis"]
    },
    {
        "id": 10,
        "styleName": "Visual_Problem_Solution_Comparison",
        "styleDescription": "A split-screen ad contrasting a messy 'Problem' scenario marked with an 'X' against a clean 'Solution' scenario.",
        "dynamicPrompt": "A dynamic split-screen promotional image comparing two [Product_Category] scenarios on a clean, modern [Setting_Environment]. On the [Problem_Side_Location]: Show a [Problem_Product_Category_and_Appearance] [Action_State], [Manner_of_Spill] [Spill_Liquid_Type] onto [Background_Objects_Ruined]. Include complementary items like [Complementary_Objects_Problem].Overlay a large [Failure_Symbol_Color] [Failure_Symbol_Shape] mark indicating failure. On the [Solution_Side_Location]: Display a sleek, [Solution_Product_Appearance] standing upright and organized, showcasing secure storage. Place [Complementary_Context_Objects] next to the [Solution_Product_Category]. Overlay a large [Success_Symbol_Color] [Success_Symbol_Shape] mark indicating success. Include Arabic text prominently: At top center, catchy headline: '[Arabic_Catchy_Headline_dynamic]'. Below that in a colored tag: '[Arabic_Key_Benefit_Tag_dynamic]'. At the bottom, reassurance tagline: '[Arabic_Reassurance_Tagline_dynamic]'.",
        "requiredVariables": ["Product_Category", "Setting_Environment", "Problem_Side_Location", "Problem_Product_Category_and_Appearance", "Action_State", "Manner_of_Spill", "Spill_Liquid_Type", "Background_Objects_Ruined", "Complementary_Objects_Problem", "Failure_Symbol_Color", "Failure_Symbol_Shape", "Solution_Side_Location", "Solution_Product_Appearance", "Complementary_Context_Objects", "Solution_Product_Category", "Success_Symbol_Color", "Success_Symbol_Shape", "Arabic_Catchy_Headline_dynamic", "Arabic_Key_Benefit_Tag_dynamic", "Arabic_Reassurance_Tagline_dynamic"]
    },
    {
        "id": 11,
        "styleName": "Smart_Home_Easy_Upgrade",
        "styleDescription": "Blends technology into a warm home environment, emphasizing 'easy installation' without professionals.",
        "dynamicPrompt": "A cozy, modern [Room_Type] interior featuring a [Lighting_or_Ambiance] [Product_Category] positioned [Product_Placement]. The [Product_Category] features [Product_Design_Details] and creates a [Atmosphere_Vibe] atmosphere. The room features stylish furniture such as [Furniture_Item_1] and [Furniture_Item_2] decorated with [Decor_Items]. The room design showcases [Architectural_Details] and a comfortable aesthetic with [Color_Palette] tones. The image includes prominent Arabic text: At the top, a bold headline: '[Main_Headline_Arabic]'. Below that, a list of features: '[Features_List_Arabic]'. In a highlighted [Callout_Box_Color] box at the [Callout_Position]: '[Ease_of_Use_Arabic]'. The overall mood is [Overall_Mood], emphasizing [Key_Selling_Point_1] and [Key_Selling_Point_2]. The focus remains on the [Product_Category] as the central element enhancing the space.",
        "requiredVariables": ["Room_Type", "Lighting_or_Ambiance", "Product_Category", "Product_Placement", "Product_Design_Details", "Atmosphere_Vibe", "Furniture_Item_1", "Furniture_Item_2", "Decor_Items", "Architectural_Details", "Color_Palette", "Main_Headline_Arabic", "Features_List_Arabic", "Callout_Box_Color", "Callout_Position", "Ease_of_Use_Arabic", "Overall_Mood", "Key_Selling_Point_1", "Key_Selling_Point_2"]
    },
    {
        "id": 12,
        "styleName": "24_7_Monitoring_Smart_Control",
        "styleDescription": "Highlights remote monitoring or continuous use by showing the physical product alongside a connected app interface.",
        "dynamicPrompt": "A modern [Product_Category] mounted/positioned on [Mounting_Location], glowing softly, positioned in a cozy, well-lit [Room_Type_and_Vibe] with [Background_Furniture] and warm ambient lighting. Next to it, a hand is holding a [Connected_Device] displaying [App_or_Screen_Action] related to the product. The scene is split vertically with a [Split_Screen_Effect] on the [Split_Side], illustrating [Continuous_Action]. [Icon_Color] neon icons representing [Feature_Icon_1], [Feature_Icon_2], [Feature_Icon_3], and [Feature_Icon_4] are floating near the phone. Arabic text in [Text_Colors] is prominently displayed at the [Text_Placement], promoting the product with phrases like '[Main_Arabic_Headline_dynamic]'. A small [Badge_Color] badge in the [Badge_Placement] indicates '[Badge_Arabic_Text_dynamic]'. The overall tone is [Overall_Tone], highlighting [Key_Selling_Point].",
        "requiredVariables": ["Product_Category", "Mounting_Location", "Room_Type_and_Vibe", "Background_Furniture", "Connected_Device", "App_or_Screen_Action", "Split_Screen_Effect", "Split_Side", "Continuous_Action", "Icon_Color", "Feature_Icon_1", "Feature_Icon_2", "Feature_Icon_3", "Feature_Icon_4", "Text_Colors", "Text_Placement", "Main_Arabic_Headline_dynamic", "Badge_Color", "Badge_Placement", "Badge_Arabic_Text_dynamic", "Overall_Tone", "Key_Selling_Point"]
    },
    {
        "id": 13,
        "styleName": "Luxury_Gifting_Bundle_Offers",
        "styleDescription": "Focuses on emotional gifting and high-end bundle offers with prominent promotional stickers.",
        "dynamicPrompt": "A luxurious gift set photo featuring a [Primary_Color] and [Secondary_Color] theme. The centerpiece is a [Main_Gift_Container_Description] with a [Ribbon_Color] ribbon, containing [Gift_Items_Inside]. The background includes [Background_Props] and [Floral_or_Decor_Elements] on the [Decor_Placement]. There is a promotional sticker on the [Sticker_Placement] of the setup in [Promo_Sticker_Color] with white Arabic text, stating '[Promo_Offer_Arabic_Text]'. The top of the image contains Arabic text in [Text_Colors], conveying a heartfelt message: '[Emotional_Headline_Arabic]', and mentioning loved ones such as '[Target_Recipient_Arabic_Text]'. The overall aesthetic is [Overall_Aesthetic], perfect for a high-end [Campaign_Type] campaign.",
        "requiredVariables": ["Primary_Color", "Secondary_Color", "Main_Gift_Container_Description", "Ribbon_Color", "Gift_Items_Inside", "Background_Props", "Floral_or_Decor_Elements", "Decor_Placement", "Sticker_Placement", "Promo_Sticker_Color", "Promo_Offer_Arabic_Text", "Text_Colors", "Emotional_Headline_Arabic", "Target_Recipient_Arabic_Text", "Overall_Aesthetic", "Campaign_Type"]
    }
];
