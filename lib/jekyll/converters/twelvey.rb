module Jekyll
    class TwelveYConverter < Converter
        safe false
        priority :low

        def matches(ext)
            ext =~ /^\.12$/i
        end

        def output_ext(ext)
            ".html"
        end

        def convert(content)
            output = `node _12y.js <<EOF\n#{content}\nEOF`
        end   
    end
end