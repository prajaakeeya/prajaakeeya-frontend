import os
import re

src_dir = r"C:\_Personal_Project\opensource\prajaakeeya-frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Matches pattern like: const FF = "'Baloo 2', sans-serif"; or const FF = "'Sora', sans-serif";
    # Match const FF = followed by any characters except semicolon/newline
    ff_def_pattern = r"(const\s+FF\s*=\s*[^;\n]+;?)"
    
    if "const FF_HEADING" in content:
        # Already processed
        return False
        
    if not re.search(ff_def_pattern, content):
        return False

    # Check if this defines a font-like value
    match = re.search(ff_def_pattern, content)
    matched_str = match.group(1)
    if "sans-serif" not in matched_str and "serif" not in matched_str:
        return False

    # Simple substitution of the definition
    # We want to maintain correct indentation
    lines_orig = content.split('\n')
    indent = ""
    for line in lines_orig:
        m = re.match(r"^(\s*)const\s+FF\s*=", line)
        if m:
            indent = m.group(1)
            break

    new_def = (
        f"const FF_HEADING = \"'Space Grotesk', sans-serif\";\n"
        f"{indent}const FF_BODY = \"'Lora', serif\";\n"
        f"{indent}const FF = FF_BODY;"
    )

    content_updated = re.sub(ff_def_pattern, new_def, content, count=1)
    
    # Now we scan line by line to replace fontFamily: FF with either FF_HEADING or FF_BODY based on heuristics
    lines = content_updated.split('\n')
    new_lines = []
    
    for line in lines:
        if "fontFamily: FF" in line:
            # Heuristics to determine if this line is heading-like
            is_heading = False
            
            # Check for header/button/chip markers
            lower_line = line.lower()
            if any(h in lower_line for h in ["variant=\"h", "variant='h", "variant={h", "variant={ 'h"]):
                is_heading = True
            elif any(h in lower_line for h in ["variant=\"subtitle", "variant='subtitle", "variant={subtitle"]):
                is_heading = True
            elif any(h in lower_line for h in ["<button", "<chip", "<dialogtitle", "<tablecell", "chip"]):
                is_heading = True
            elif any(h in lower_line for h in ["fontweight: 700", "fontweight: 800", "fontweight: 900", "fontweight: 'bold'", "fontweight: \"bold\""]):
                is_heading = True
            elif any(h in lower_line for h in ["fontweight={700}", "fontweight={800}", "fontweight={900}"]):
                is_heading = True
            elif any(h in lower_line for h in ["texttransform: 'uppercase'", "texttransform: \"uppercase\""]):
                is_heading = True
            elif any(h in lower_line for h in ["kicker", "motto", "brand", "logo", "title", "header"]):
                is_heading = True
                
            # Replace based on heuristic
            if is_heading:
                line = line.replace("fontFamily: FF", "fontFamily: FF_HEADING")
            else:
                line = line.replace("fontFamily: FF", "fontFamily: FF_BODY")
                
        new_lines.append(line)
        
    final_content = '\n'.join(new_lines)
    
    if final_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(final_content)
        return True
        
    return False

modified_files = []
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            try:
                if process_file(filepath):
                    modified_files.append(os.path.relpath(filepath, src_dir))
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

print(f"Successfully processed {len(modified_files)} files:")
for f in modified_files:
    print(f" - {f}")
