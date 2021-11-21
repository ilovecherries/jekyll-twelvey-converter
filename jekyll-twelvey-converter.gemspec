# frozen_string_literal: true

require_relative "lib/jekyll-twelvey-converter/version"

Gem::Specification.new do |spec|
  spec.name          = "jekyll-twelvey-converter"
  spec.version       = Jekyll::TwelveYConverter::VERSION
  spec.authors       = ["Cherry"]
  spec.email         = ["ilovecherries@protonmail.com"]
  spec.summary       = %q{12y converter for Jekyll.}
  spec.homepage      = "https://github.com/ilovecherries/jekyll-twelvey-converter"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0")
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  # spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "RedCloth", "~> 4.0"

  spec.add_development_dependency "bundler"
  spec.add_development_dependency "rake", ">= 12.3.3"
  spec.add_development_dependency "rspec", "~> 3.0"
end