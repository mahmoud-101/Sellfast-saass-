import React, { useState, useEffect } from 'react';
import { DynamicAdsStudioProject, DynamicPromptStyle, ImageFile } from '../types';
import { generateImage } from '../services/geminiService';
import { deductCredits, CREDIT_COSTS } from '../lib/supabase';
import { resizeImage } from '../utils';
import ImageWorkspace from './ImageWorkspace';

const MagicWandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;

const DYNAMIC_STYLES: DynamicPromptStyle[] = [
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
    }
];

const DynamicAdsStudio: React.FC<{
    project: DynamicAdsStudioProject;
    setProject: React.Dispatch<React.SetStateAction<DynamicAdsStudioProject>>;
    userId?: string;
    refreshCredits?: () => void;
}> = ({ project, setProject, userId, refreshCredits }) => {

    const selectedStyle = DYNAMIC_STYLES.find(s => s.id === project.selectedStyleId);

    // Initialize variables when a new style is selected
    useEffect(() => {
        if (selectedStyle && Object.keys(project.variableValues).length === 0) {
            const initialVars: Record<string, string> = {};
            selectedStyle.requiredVariables.forEach(v => {
                initialVars[v] = '';
            });
            setProject(p => ({ ...p, variableValues: initialVars }));
        }
    }, [selectedStyle?.id]);

    const handleFileUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploading: true }));
        try {
            const uploaded = await Promise.all(files.map(async file => {
                const resized = await resizeImage(file, 2048, 2048);
                const reader = new FileReader();
                return new Promise<ImageFile>(res => {
                    reader.onloadend = () => res({ base64: (reader.result as string).split(',')[1], mimeType: resized.type, name: resized.name });
                    reader.readAsDataURL(resized);
                });
            }));
            setProject(s => ({ ...s, productImages: [...(s.productImages || []), ...uploaded], isUploading: false }));
        } catch (err) { setProject(s => ({ ...s, isUploading: false })); }
    };

    const setVariableValue = (varName: string, val: string) => {
        setProject(p => ({ ...p, variableValues: { ...p.variableValues, [varName]: val } }));
    };

    const handleGenerate = async () => {
        if (!project || !selectedStyle || !userId || project.productImages.length === 0) return;

        // Check if all variables are filled
        const missingVars = selectedStyle.requiredVariables.filter(v => !project.variableValues[v]?.trim());
        if (missingVars.length > 0) {
            setProject(s => ({ ...s, error: `الرجاء تعبئة جميع الحقول المطلوبة.` }));
            return;
        }

        const totalCost = CREDIT_COSTS.IMAGE_BASIC;
        setProject(s => ({ ...s, isGenerating: true, error: null }));
        const deducted = await deductCredits(userId, totalCost);
        if (!deducted) { setProject(s => ({ ...s, isGenerating: false, error: `رصيد غير كافٍ.` })); return; }

        // Replace Variables in the prompt
        let finalPrompt = selectedStyle.dynamicPrompt;
        selectedStyle.requiredVariables.forEach(v => {
            finalPrompt = finalPrompt.replace(new RegExp(`\\[${v}\\]`, 'g'), project.variableValues[v]);
        });

        // Add product instruction constraint
        finalPrompt += ` STRICT INSTRUCTION: Explicitly use the provided user uploaded reference image as the main product. DO NOT hallucinate the product.`;

        try {
            const img = await generateImage(project.productImages, finalPrompt, null, "3:4");
            const newResult = { id: Date.now().toString(), styleName: selectedStyle.styleName, image: img, isLoading: false, error: null };

            setProject(s => ({ ...s, isGenerating: false, results: [newResult, ...s.results] }));
            if (refreshCredits) refreshCredits();
        } catch (err) {
            setProject(s => ({ ...s, isGenerating: false, error: 'فشل التوليد، يرجى المحاولة مرة أخرى.' }));
        }
    };

    return (
        <main className="w-full flex flex-col gap-10 pt-4 pb-12 animate-in fade-in duration-700 text-right" dir="rtl">
            <div className="bg-white/5 rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl">
                <div className="flex flex-col lg:flex-row gap-12">

                    <div className="lg:w-1/3 space-y-8">
                        <h2 className="text-3xl font-black text-white flex items-center justify-start tracking-tighter">
                            <span className="text-blue-500 text-4xl ml-3">✨</span> المتغيرات الديناميكية
                        </h2>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed">
                            اختر القالب وقم بتعبئة المتغيرات المخصصة له لإنشاء إعلانك المميز.
                        </p>

                        <ImageWorkspace id="dy-up" images={project?.productImages || []} onImagesUpload={handleFileUpload} onImageRemove={(i) => setProject(s => ({ ...s, productImages: (s.productImages || []).filter((_, idx) => idx !== i) }))} isUploading={project?.isUploading || false} />
                    </div>

                    <div className="lg:w-2/3 flex flex-col gap-8">
                        <div className="space-y-4">
                            <label className="text-sm text-slate-400 font-bold block">1. اختر القالب (Style Template)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {DYNAMIC_STYLES.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => {
                                            setProject(s => ({ ...s, selectedStyleId: style.id, variableValues: {} })); // Reset vars on change
                                        }}
                                        className={`p-4 rounded-[1.5rem] border-2 transition-all text-right flex flex-col gap-2 ${project.selectedStyleId === style.id ? 'bg-blue-500/10 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'}`}
                                    >
                                        <span className="font-black text-sm">{style.styleName.replace(/_/g, ' ')}</span>
                                        <span className="text-[10px] opacity-70 line-clamp-2 md:line-clamp-3 leading-relaxed">{style.styleDescription}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedStyle && (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mt-4 animate-in slide-in-from-bottom-5">
                                <h3 className="text-lg font-black text-white mb-6">2. املأ الفراغات (Variables)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedStyle.requiredVariables.map((variable) => (
                                        <div key={variable} className="flex flex-col gap-1.5">
                                            <label className="text-xs text-blue-400 font-bold">[{variable.replace(/_/g, ' ')}]</label>
                                            <input
                                                type="text"
                                                value={project.variableValues[variable] || ''}
                                                onChange={(e) => setVariableValue(variable, e.target.value)}
                                                placeholder="أدخل القيمة المناسبة..."
                                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60 transition-colors shadow-inner"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {project.error && (
                                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold animate-pulse text-center">
                                        {project.error}
                                    </div>
                                )}

                                <button
                                    onClick={handleGenerate}
                                    disabled={project.isGenerating || project.productImages.length === 0}
                                    className="w-full mt-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                                >
                                    {project.isGenerating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>جاري تركيب السحر...</span>
                                        </>
                                    ) : (
                                        <>توليد باستخدام الديناميك (${CREDIT_COSTS.IMAGE_BASIC} نقطة) <MagicWandIcon /></>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Results grid */}
            {project.results.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white px-2">معرض النتائج الديناميكية</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {project.results.map((res) => (
                            <div key={res.id} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 group hover:border-blue-500/30 transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">{res.styleName.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="aspect-[3/4] rounded-[1.5rem] overflow-hidden bg-black relative shadow-inner">
                                    {res.image ? (
                                        <img src={`data:${res.image.mimeType};base64,${res.image.base64}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Generated Dynamic" />
                                    ) : res.error ? (
                                        <div className="h-full flex items-center justify-center text-red-400 font-bold p-6 text-center text-sm">{res.error}</div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-blue-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Processing...</div>
                                    )}
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <button
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-black text-xs transition-colors"
                                        onClick={() => { if (res.image) { const a = document.createElement('a'); a.href = `data:${res.image.mimeType};base64,${res.image.base64}`; a.download = `Dynamic_${res.styleName}.png`; a.click(); } }}
                                    >
                                        تحميل عالي الجودة
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
};

export default DynamicAdsStudio;
