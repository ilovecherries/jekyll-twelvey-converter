require 'jekyll'

root = File.expand_path('jekyll-twelvey-converter', File.dirname(__FILE__))
require "#{root}/filters"
require "#{root}/version"

require File.expand_path('jekyll/converters/twelvey', File.dirname(__FILE__))

module Jekyll
  module TwelveYConverter
  end
end